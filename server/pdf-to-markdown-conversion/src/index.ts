import cors from 'cors';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import 'dotenv/config';

import MarkdownExtractor from './Converter/MarkdownExtractor';
import { extractPdfToXml, getPageCount } from './Converter/PdfToHtml';
import SupabaseService from './utils/Connector';
import { FRONTEND_DOMAIN } from './utils/constants';
import jwt from 'jsonwebtoken';
import { createLogger } from './utils/logger';
import { getMarkdownSections, Section } from './utils/HeadingSplitter';
import { getVectors } from './Converter/Embeddings';
import { improveTextWithAI } from './Converter/AiOptimizers';

const app = express();
const upload = multer({ dest: './upload' });
const logger = createLogger("index.ts");

// Enable CORS
app.use(cors({ origin: FRONTEND_DOMAIN }));

// Health check endpoint
app.get('/health', (req: any, res: any) => {
  res.status(200).json({ message: 'Server is running' });
});

// Validate JWT token
app.use((req: any, res: any, next: any) => {
  logger.info('Checking authorization token...');
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    logger.warn('No token provided');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.token = token;
  next();
});

app.post('/upload', upload.single('file'), async (req: any, res) => {
  const file = req.file;
  if (!file) {
    logger.warn('No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const db = new SupabaseService(req.token);

  // Extract the file extension from the request object
  const fileExtension = path.extname(file.originalname);

  const fileId = await db.createDocument(file.originalname.replace(fileExtension, ''));
  logger.debug('Processing document ', { id: fileId });

  fs.mkdirSync(`./upload/${fileId}`);
  //check if the folder exists, if not create it
  if (!fs.existsSync(`./upload/markdown`)) {
    fs.mkdirSync(`./upload/markdown`);
  }

  // Move the uploaded file into the created folder with the new name
  fs.renameSync(file.path, `./upload/${fileId}/${fileId}${fileExtension}`);

  if(await getPageCount(`./upload/${fileId}/${fileId}${fileExtension}`) > 30) {
    logger.warn('The document contains more than 30 pages. Aborting conversion.');
    db.deleteDocument(fileId);
    return res.status(400).json({ error: 'The document has more than 30 pages. Rimori will be able to read such files soon.' });
  }

  processDocument(db, fileId, req.token);

  return res.status(200).json({ message: 'File uploaded successfully' });
});

async function processDocument(db: SupabaseService, fileId: string, token: string) {
  try {
    const markdown = await convertPdfToMarkdown(fileId);
    const sections = await splitMarkdownIntoSections(markdown);
    const markdown2 = sections.map(section => section.markdown).join("\n\n");

    //write markdown to file in upload/markdown folder
    fs.writeFileSync(`./upload/markdown/${fileId}.md`, markdown2);

    await uploadMarkdownDocument(token, fileId, markdown2);
    const sections2 = await getMarkdownSections(markdown2);
    let headingID = "";

    logger.info("Creating heading section relationships")
    for (let index = 0; index < sections2.length; index++) {
      logger.info(`Creating heading section relationships for section ${index} of ${sections2.length}`);
      const { heading, markdown, level } = sections2[index];
      const sectionId = await db.createDocumentSection(fileId, heading, level, markdown, await getVectors(markdown), index);

      //if first characters are markdown h1 or h2,then get the section id and store it in headingID
      if (markdown.startsWith("# ") || markdown.startsWith("## ")) {
        headingID = sectionId;
      }
      await db.createSectionRelation(headingID, sectionId);
    }

    await db.setRealHeadings(fileId);
    logger.info("Heading section relationships created")

    fs.rm(`./upload/${fileId}`, { recursive: true },
      (err) => err && logger.error("Error at deleting the markup conversion folder", { err }));

    logger.info('Document processed successfully.', { id: fileId });

    await db.completeDocument(fileId, markdown2);

  } catch (error: any) {
    logger.error('Failed to convert PDF to Markdown:', error);
    await db.deleteDocument(fileId);
    fs.rm(`./upload/${fileId}`, { recursive: true },
      (err) => err && logger.error("Error at deleting the markup conversion folder", { err }));

    //return res.status(400).json({ error: error.message });
  }
}

app.listen(3001, () => {
  logger.info('Server is running on port 3001');
  logger.info("The following domain is allowed to access the server:", { FRONTEND_DOMAIN });
});

async function convertPdfToMarkdown(fileId: string) {
  logger.info('Converting PDF to Markdown...');

  const xml = await extractPdfToXml(fileId);

  const pages = await new MarkdownExtractor().getMarkdown(xml, "upload/assets");

  const totalPercentageOfLines = pages.map((page) => getImageRatio(page))
    .filter((percentage) => percentage !== null)
    .reduce((acc, curr) => (acc + curr) / 2);

  logger.debug('Total percentage of images:' + totalPercentageOfLines);

  if (totalPercentageOfLines > 80) {
    logger.error('The document contains more than 80% images.');
    throw new Error("The document mainly contains images and only little text. Rimori will be able to read such files soon.");
  }
  fs.writeFileSync(`./upload/markdown/${fileId}_withoutAI.md`, pages.join('\n\n'));

  logger.info('PDF converted to Markdown successfully. ', { id: fileId });

  return pages.join('\n\n');
}

async function splitMarkdownIntoSections(markdown: string): Promise<Section[]> {
  const sections2 = await getMarkdownSections(markdown);

  //map through sections and improve each section with AI
  const improvedSections = await Promise.all(sections2.map(async (section) => {
    section.markdown = await improveTextWithAI(section.markdown);
    return section;
  }));

  return improvedSections;
}

async function uploadMarkdownDocument(token: string, id: string, markdown: string) {
  const client = new SupabaseService(token)
  const { sub } = jwt.decode(token) as { sub: string };

  // Get all image files in the folder and upload them to the Supabase storage
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.svg', '.webp', '.ico'];

  const assets = fs.readdirSync(`./upload/${id}`).filter(file => {
    const fileExtension = path.extname(file).toLowerCase();
    return imageExtensions.includes(fileExtension);
  });

  await Promise.all(assets.map(async (file) => {
    logger.debug('Uploading image: ' + file);
    await client.uploadAsset(`./upload/${id}/${file}`, sub + "/" + file);
  }));

  //upload the original pdf file
  logger.info('Uploading original PDF file');
  await client.uploadDocument(`./upload/${id}/${id}.pdf`, sub + "_" + id + "_original.pdf");


  logger.info('Markdown document uploaded successfully.', { id });
}

function getImageRatio(markdown: string): number | null {
  // Regular expression to match Markdown image syntax
  const imageRegex = /!\[.*?\]\(.*?\)/;

  // Split the document into lines
  const lines = markdown.split('\n').filter(line => line.trim() !== '');

  const totalLines = lines.length;

  if (totalLines === 0) {
    return null;
  }

  // Count the number of lines that are images
  const imageLinesCount = lines.filter(line => imageRegex.test(line.trim())).length;

  return (imageLinesCount / totalLines) * 100;
}