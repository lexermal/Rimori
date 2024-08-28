import { parseString } from 'xml2js';
import { createLogger } from '../utils/logger';

const logger = createLogger("MarkdownExtractor.ts");

class MarkdownExtractor {

  public async getMarkdown(xml: string, uploadFolder: string): Promise<string[]> {

    const xmlObject = await this.convertToObj(xml);

    return this.toArray(xmlObject.pdf2xml.page).map((page: any, index: number) => {
      logger.info(`Converting page ${index + 1} to markdown...`);

      // Create a map to store the resulting markdown based on the order of the elements found in the xml as "top" attribute
      const resultingMarkdown = new Map<number, string>();

      // Extract text data from the page, and store it in the resultingMarkdown map
      this.toArray(page.text).forEach((textElement: any) => {
        const top = parseInt(textElement.$.top);
        const textData = this.extractTextData(textElement);
        const contentonSameLine = resultingMarkdown.get(top) || '';
        resultingMarkdown.set(top, contentonSameLine + " " + textData);
      });

      // Extract image data from the page, and store it in the resultingMarkdown map
      this.toArray(page.image).forEach((imageElement: any) => {
        const top = parseInt(imageElement.$.top);
        const imageData = this.extractImageData(imageElement, uploadFolder);
        const contentonSameLine = resultingMarkdown.get(top) || '';
        resultingMarkdown.set(top, contentonSameLine + " " + imageData);
      });

      // Sort the resultingMarkdown map based on the "top" attribute
      const sortedMarkdown = new Map([...resultingMarkdown.entries()].sort((a, b) => a[0] - b[0]));

      // logger.info('resultingMarkdown:', sortedMarkdown);

      return Array.from(sortedMarkdown.values()).join('\n\n');
    });
  }

  private extractTextData(textElement: any): string {
    // Extract text data from the text element and convert it to markdown

    // logger.info('Text element:', textElement);

    const headingAttribute = parseInt(textElement.$.height);
    const heading = headingAttribute ? this.fontSizeToMarkdownHeading(headingAttribute) : "";

    if (textElement.b) {
      return `${heading}**${textElement.b[0]}**`;
    }

    if (textElement.i) {
      return `${heading}*${textElement.i[0]}*`;
    }

    if (textElement.a) {
      // logger.info('Text element with link:', textElement.a);
      return `${heading}[${this.extractTextData(textElement.a[0])}](${textElement.a[0].$.href})`;
    }

    if (textElement.u) {
      return `<u>${textElement._}</u>`;
    }

    if (!textElement._) {
      console.error('Unknown text element:', textElement);
      return '';
    }

    return heading + textElement._;

  }

  private extractImageData(imageElement: any, uploadFolder: string): string {
    // logger.info('Image element:', imageElement);
    // Extract image data from the image element and convert it to markdown
    return `![Image](${uploadFolder}/${imageElement.$.src})`;
  }

  private toArray(obj: any): any[] {
    if (!obj) return [];

    return Array.isArray(obj) ? obj : [obj];
  }

  private fontSizeToMarkdownHeading(fontSize: number): string {
    if (fontSize >= 40) return '# ';
    else if (fontSize >= 30) return '## ';
    else if (fontSize >= 25) return '### ';
    else if (fontSize >= 20) return '#### ';
    else return "";
  }

  private convertToObj(xml: string): Promise<any> {
    return new Promise((resolve, reject) => {
      parseString(xml, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
}

export default MarkdownExtractor;
