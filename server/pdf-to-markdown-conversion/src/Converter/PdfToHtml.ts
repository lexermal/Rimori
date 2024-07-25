import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

export async function extractPdfToHtml(fileId: string): Promise<string> {
  try {
    const { stdout, stderr, } = await execAsync(`pdftohtml -hidden -c -xml -nodrm ${fileId}.pdf`, { cwd: "./upload/" + fileId });
    console.log('Command output:', stdout);
    stderr && console.error('Command error output:', stderr);

    // Read the resulting XML file
    const xmlFilePath = `./upload/${fileId}/${fileId}.xml`;
    return await fs.promises.readFile(xmlFilePath, 'utf-8');
  } catch (error) {
    console.error('Error extracting PDF to HTML:', error);
    throw error;
  }
}
