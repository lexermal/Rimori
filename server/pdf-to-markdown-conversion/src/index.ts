import 'dotenv/config';
import jwt from 'jsonwebtoken';

import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

import { extractPdfToHtml } from './Converter/PdfToHtml';
import MarkdownExtractor from './Converter/MarkdownExtractor';
import { improveTextWithAI } from './utils/AiOptimizers';
import AppwriteService from './utils/ApprwriteConnector'

const app = express();
const upload = multer({ dest: './upload' });
const awService = AppwriteService.getInstance();

// Validate JWT token and extract email address
app.use((req: any, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || '') as { email: string };
    req.email = decodedToken.email;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

app.post('/upload', upload.single('file'), async (req: any, res) => {
  // Handle the uploaded file here
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Extract the file extension from the request object
  const fileExtension = path.extname(file.originalname);

  const fileId = await awService.createDocument(file.originalname, req.email);

  fs.mkdirSync(`./upload/${fileId}`);

  // Move the uploaded file into the created folder with the new name
  const filePath = `./upload/${fileId}/${fileId}${fileExtension}`;
  fs.renameSync(file.path, filePath);

  const markdown = await convertPdfToMarkdown(fileId);
  uploadMarkdownDocument(fileId, markdown);

  return res.status(200).json({ message: 'File uploaded successfully' });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});


async function convertPdfToMarkdown(fileId: string) {
  console.log('Converting PDF to Markdown...');

  const xml = await extractPdfToHtml(fileId);

  const assetPath = process.env.ASSET_PATH || ".";

  const markdownPages = await new MarkdownExtractor().getMarkdown(xml, assetPath);

  const improvedMarkdown = await Promise.all(markdownPages.map(async (page, index) => {
    console.log('Improving page ' + index + ' with AI');
    return await improveTextWithAI(page);
  }));

  const finishedMarkdown = improvedMarkdown.join('\n\n');

  //  write the markdown to a file
  const markdownFilePath = `./upload/${fileId}/output.md`;
  // console.log('Markdown file path:', markdownFilePath);
  fs.writeFileSync(markdownFilePath, finishedMarkdown);

  console.log('PDF converted to Markdown successfully. ID: ', fileId);

  return finishedMarkdown;
}


function uploadMarkdownDocument(fileId: string, markdown: string) {
  const awService = AppwriteService.getInstance();

  // Get all .png files in the folder and upload them to the Appwrite storage
  const files = fs.readdirSync(`./upload/${fileId}`).filter((file) => file.endsWith('.png'));
  files.forEach(async (file) => {
    console.log('Uploading image:', file);
    const id = await awService.uploadFile(`./upload/${fileId}/${file}`, file);
    // console.log('Image uploaded with ID:', id);
  });

  //upload the original pdf file
  awService.uploadFile(`./upload/${fileId}/${fileId}.pdf`, fileId + "_original.pdf");

  awService.updateDocument(fileId, markdown);

  console.log('Markdown document uploaded successfully. ID:', fileId);

  // Clean up the folder
  // fs.rmdirSync(`./upload/${fileId}`, { recursive: true });

}