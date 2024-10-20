import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import { createLogger } from '../utils/logger';
import { PDFDocument } from 'pdf-lib';

const execAsync = promisify(exec);
const logger = createLogger("PdfToHtml.ts");

export async function extractPdfToXml(fileId: string): Promise<string> {
  try {
    const { stdout, stderr, } = await execAsync(`pdftohtml -hidden -c -xml -nodrm ${fileId}.pdf`, { cwd: "./upload/" + fileId });
    logger.info('Command output:', { output: stdout });
    stderr && logger.error('Command error output:', { error: stderr });

    // Read the resulting XML file
    const xmlFilePath = `./upload/${fileId}/${fileId}.xml`;
    return await fs.promises.readFile(xmlFilePath, 'utf-8');
  } catch (error) {
    logger.error('Error extracting PDF to HTML', { error });
    throw error;
  }
}


export async function getPageCount(pdfPath: string): Promise<number> {
    // Read the PDF file into a buffer
    const pdfBuffer = fs.readFileSync(pdfPath);
  
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer);
  
    // Get the number of pages
    const numberOfPages = pdfDoc.getPageCount();
  
    return numberOfPages;
}