import cors from 'cors';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import 'dotenv/config';

import MarkdownExtractor from './Converter/MarkdownExtractor';
import { extractPdfToHtml } from './Converter/PdfToHtml';
import { improveTextWithAI } from './utils/AiOptimizers';
import SupabaseService from './utils/Connector';
import { ASSET_PATH, FRONTEND_DOMAIN } from './utils/constants';
import jwt from 'jsonwebtoken';
import { createLogger } from './utils/logger';

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
  logger.info('Validating JWT token...');
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.token = token;
  next();
});

app.post('/upload', upload.single('file'), async (req: any, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const db = new SupabaseService(req.token);

  // Extract the file extension from the request object
  const fileExtension = path.extname(file.originalname);

  const fileId = await db.createDocument(file.originalname.replace(fileExtension, ''));
  logger.debug('File ID:', fileId);

  fs.mkdirSync(`./upload/${fileId}`);

  // Move the uploaded file into the created folder with the new name
  fs.renameSync(file.path, `./upload/${fileId}/${fileId}${fileExtension}`);

  await uploadMarkdownDocument(req.token, fileId, await convertPdfToMarkdown(fileId));

  return res.status(200).json({ message: 'File uploaded successfully' });
});

app.listen(3001, () => {
  logger.info('Server is running on port 3001');
});

async function convertPdfToMarkdown(fileId: string) {
  logger.info('Converting PDF to Markdown...');

  const xml = await extractPdfToHtml(fileId);

  const pages = await new MarkdownExtractor().getMarkdown(xml, ASSET_PATH);

  const markdown = await improveTextWithAI(pages);

  logger.info('PDF converted to Markdown successfully. ID: ', fileId);

  return markdown;
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
    logger.debug('Uploading image:', file);
    await client.uploadAsset(`./upload/${id}/${file}`, sub + "/" + file);
  }));

  //upload the original pdf file
  logger.info('Uploading original PDF file');
  await client.uploadDocument(`./upload/${id}/${id}.pdf`, sub + "_" + id + "_original.pdf");

  await client.completeDocument(id, markdown);

  logger.info('Markdown document uploaded successfully. ID:', id);

  // Clean up the folder
  fs.rm(`./upload/${id}`, { recursive: true }, (err) => err && logger.error(err));
}