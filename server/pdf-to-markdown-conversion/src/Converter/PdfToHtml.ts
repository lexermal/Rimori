import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import { createLogger } from '../utils/logger';

const execAsync = promisify(exec);
const logger = createLogger("PdfToHtml.ts");

export async function extractPdfToXml(fileId: string): Promise<string> {
  try {
    const { stdout, stderr, } = await execAsync(`pdftohtml -hidden -c -xml -nodrm ${fileId}.pdf`, { cwd: "./upload/" + fileId });
    logger.info('Command output:', stdout);
    stderr && logger.error('Command error output:', stderr);

    // Read the resulting XML file
    const xmlFilePath = `./upload/${fileId}/${fileId}.xml`;
    return await fs.promises.readFile(xmlFilePath, 'utf-8');
  } catch (error) {
    logger.error('Error extracting PDF to HTML:', error);
    throw error;
  }
}
