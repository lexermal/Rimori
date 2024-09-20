import { parseString } from 'xml2js';
import { createLogger } from '../utils/logger';

const logger = createLogger("MarkdownExtractor.ts");

class MarkdownExtractor {

  public async getMarkdown(xml: string, uploadFolder: string): Promise<string[]> {

    const xmlObject = await this.convertToObj(xml);

    const biggestFontSize = this.toArray(xmlObject.pdf2xml.page).reduce((biggestFontSize: number, page: any) => {
      const pageBiggestFontSize = this.toArray(page.text).reduce((biggestFontSize: number, textElement: any) => {
        const fontSize = parseInt(textElement.$.height);
        return Math.max(biggestFontSize, fontSize);
      }, 0);

      return Math.max(biggestFontSize, pageBiggestFontSize);
    }, 0);

    // const smallestFontSize = this.toArray(xmlObject.pdf2xml.page).reduce((smallestFontSize: number, page: any) => {
    //   const pageSmallestFontSize = this.toArray(page.text).reduce((smallestFontSize: number, textElement: any) => {
    //     const fontSize = parseInt(textElement.$.height);
    //     return Math.min(smallestFontSize, fontSize);
    //   }, 1000);

    //   return Math.min(smallestFontSize, pageSmallestFontSize);
    // }, 1000);

    return this.toArray(xmlObject.pdf2xml.page).map((page: any, index: number) => {
      logger.info(`Converting page ${index + 1} to markdown...`);

      // Create a map to store the resulting markdown based on the order of the elements found in the xml as "top" attribute
      // const resultingMarkdown = new Map<number, string>();

      const mostUsedFontSizeInt = this.getMostUsedFontSizeInt(page);


      const isTwoColumnLayout = this.detectTwoColumnLayout(page);
      logger.info(`Page ${index + 1} is a two-column layout: ${isTwoColumnLayout}`);

      const { firstColumn, secondColumn } = this.arrangeContentInColumns(page, isTwoColumnLayout);

      const sortedMarkdown = this.xml2TextLines(firstColumn.text, firstColumn.images, biggestFontSize, mostUsedFontSizeInt, uploadFolder);
      let markdown = Array.from(sortedMarkdown.values()).join('\n\n')
      if (isTwoColumnLayout) {
        const secondColumnMarkdown = Array.from(this.xml2TextLines(secondColumn.text, secondColumn.images, biggestFontSize, mostUsedFontSizeInt, uploadFolder).values()).join('\n\n');
        markdown += `\n\n${secondColumnMarkdown}`;
      }
      return replaceSentenceLineSplits(markdown);
    });
  }

  private arrangeContentInColumns(page: any, isTwoColumnLayout: boolean): {
    firstColumn: { text: any[], images: any[] },
    secondColumn: { text: any[], images: any[] }
  } {
    const content = {
      firstColumn: { text: [] as any[], images: [] as any[] },
      secondColumn: { text: [] as any[], images: [] as any[] }
    };

    // const  = this.detectTwoColumnLayout(page);
    const columnThreshold = 200; // Define a threshold to separate columns based on the `left` position

    // Distribute text content
    this.toArray(page.text).forEach((textElement: any) => {
      const leftPosition = parseInt(textElement.$.left);

      if (isTwoColumnLayout && leftPosition < columnThreshold) {
        content.firstColumn.text.push(textElement); // Push raw text element
      } else if (isTwoColumnLayout && leftPosition >= columnThreshold) {
        content.secondColumn.text.push(textElement); // Push raw text element
      } else {
        // For one-column layout, push everything into the first column
        content.firstColumn.text.push(textElement); // Push raw text element
      }
    });

    // Distribute image content
    this.toArray(page.image).forEach((imageElement: any) => {
      const leftPosition = parseInt(imageElement.$.left);

      if (isTwoColumnLayout && leftPosition < columnThreshold) {
        content.firstColumn.images.push(imageElement); // Push raw image element
      } else if (isTwoColumnLayout && leftPosition >= columnThreshold) {
        content.secondColumn.images.push(imageElement); // Push raw image element
      } else {
        // For one-column layout, push everything into the first column
        content.firstColumn.images.push(imageElement); // Push raw image element
      }
    });

    return content;
  }



  private detectTwoColumnLayout(page: any): boolean {
    const positionFrequency: { [key: number]: number } = {};
    const thresholdDistance = 200; // Define a reasonable threshold for "far apart"

    // Collect horizontal positions (left attribute) of text elements
    this.toArray(page.text).forEach((textElement: any) => {
      const leftPosition = parseInt(textElement.$.left);

      if (positionFrequency[leftPosition]) {
        positionFrequency[leftPosition]++;
      } else {
        positionFrequency[leftPosition] = 1;
      }
    });

    // console.log({ positionFrequency });

    // Find the two most frequent positions
    const sortedPositions = Object.keys(positionFrequency)
      .map(Number)
      .sort((a, b) => positionFrequency[b] - positionFrequency[a]);

    if (sortedPositions.length < 2) {
      // Less than 2 distinct positions, so no two-column layout
      return false;
    }

    // Check if the two most frequent positions are far enough apart to suggest a two-column layout
    const firstMax = sortedPositions[0];
    const secondMax = sortedPositions[1];

    return Math.abs(firstMax - secondMax) > thresholdDistance;
  }




  private xml2TextLines(text: any[], image: any[], biggestFontSize: number, mostUsedFontSizeInt: number, uploadFolder: string): Map<number, string> {
    // Create a map to store the resulting markdown based on the order of the elements found in the xml as "top" attribute
    const resultingMarkdown = new Map<number, string>();

    //const mostUsedFontSizeInt = this.getMostUsedFontSizeInt(page);

    // Extract text data from the page, and store it in the resultingMarkdown map
    this.toArray(text).forEach((textElement: any) => {
      const top = parseInt(textElement.$.top);
      const textData = this.extractTextData(textElement, biggestFontSize, mostUsedFontSizeInt);
      const contentOnSameLine = resultingMarkdown.get(top);
      resultingMarkdown.set(top, contentOnSameLine ? `${contentOnSameLine} ${textData}` : textData);
    });

    // Extract image data from the page, and store it in the resultingMarkdown map
    this.toArray(image).forEach((imageElement: any) => {
      const top = parseInt(imageElement.$.top);
      const imageData = this.extractImageData(imageElement, uploadFolder);
      const contentonSameLine = resultingMarkdown.get(top);
      resultingMarkdown.set(top, contentonSameLine ? `${contentonSameLine} ${imageData}` : imageData);
    });

    // Sort the resultingMarkdown map based on the "top" attribute
    const sortedMarkdown = new Map([...resultingMarkdown.entries()].sort((a, b) => a[0] - b[0]));
    return sortedMarkdown;
  }

  private extractTextData(textElement: any, biggestFontSize: number, smallestFont: number): string {
    // Extract text data from the text element and convert it to markdown

    const headingAttribute = parseInt(textElement.$.height);
    const heading = headingAttribute ? this.fontSizeToMarkdownHeading(biggestFontSize, smallestFont, headingAttribute) : "";

    if (textElement.b) {
      const text = textElement.b[0].toString().trim();

      if (text.length === 0) {
        return '';
      }

      if (textElement.$.href) {
        return `${heading}[**${text}**](${textElement.$.href})`;
      }

      return `${heading}**${text}**`;
    }

    if (textElement.i) {
      const text = textElement.i[0].toString().trim();

      if (text.length === 0) {
        return '';
      }

      if (textElement.$.href) {
        return `${heading}[*${text}*](${textElement.$.href})`;
      }

      if (textElement.i[0].b) {
        const text = textElement.i[0].b[0].toString().trim();
        return `${heading}***${text}***`;
      }

      return `${heading}*${text}*`;
    }

    if (textElement.a) {
      const linkElement = textElement.a[0];

      if (linkElement.b) {
        return `${heading}[**${linkElement.b[0].toString().trim()}**](${linkElement.$.href})`;
      }

      if (linkElement.i) {
        return `${heading}[*${linkElement.i[0].toString().trim()}*](${linkElement.$.href})`;
      }


      if (linkElement._) {
        return `${heading}[${linkElement._.toString().trim()}](${linkElement.$.href})`;
      }

      //return nothing as the link got split into multiple elements
      return "";
    }

    if (textElement.u) {
      return `<u>${textElement._.toString().trim()}</u>`;
    }

    if (textElement._) {
      return heading + textElement._.toString().trim();
    }

    if (Object.keys(textElement).length > 1) {
      logger.error('Unknown text element:', textElement);
    }

    return '';
  }

  private getMostUsedFontSizeInt(page: any): number {
    const fontSizeFrequency: { [key: number]: number } = {};

    // Populate the frequency map
    this.toArray(page.text).forEach((textElement: any) => {
      const fontSize = parseInt(textElement.$.height);
      if (fontSizeFrequency[fontSize]) {
        fontSizeFrequency[fontSize]++;
      } else {
        fontSizeFrequency[fontSize] = 1;
      }
    });

    // Find the most used font size
    let mostUsedFontSize = 0;
    let maxFrequency = 0;
    for (const [fontSize, frequency] of Object.entries(fontSizeFrequency)) {
      if (frequency > maxFrequency) {
        maxFrequency = frequency;
        mostUsedFontSize = parseInt(fontSize);
      }
    }

    return mostUsedFontSize;
  }

  private extractImageData(imageElement: any, uploadFolder: string): string {
    // Extract image data from the image element and convert it to markdown
    return `![Image](${uploadFolder}/${imageElement.$.src})`;
  }

  private toArray(obj: any): any[] {
    if (!obj) return [];

    return Array.isArray(obj) ? obj : [obj];
  }

  private fontSizeToMarkdownHeading(biggestFont: number, smallestFont: number, currentFontSize: number): string {
    // console.log({ biggestFont, smallestFont, currentFontSize });

    if (smallestFont < 10) {
      smallestFont = 10;
    }

    if (currentFontSize < smallestFont * 1.5) {
      return ""; // Return empty string for normal text, no heading
    }

    // Normalize currentFontSize to a range between 0 and 1
    const normalizedSize = (currentFontSize - smallestFont) / (biggestFont - smallestFont);

    // Map normalized size to heading levels 1 to 4 using a logarithmic scale
    const headingLevel = Math.ceil(1 + 3 * Math.log2(normalizedSize + 1));

    // Clamp the heading level between 1 and 4
    const clampedHeadingLevel = Math.max(1, Math.min(headingLevel, 4));

    // Reverse the level for Markdown (h1 is the biggest)
    const markdownLevel = 5 - clampedHeadingLevel;

    // Return the corresponding number of '#' symbols for Markdown
    return ("#".repeat(markdownLevel)) + " ";
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

function replaceSentenceLineSplits(text: string): string {
  // replace lines that just contain spaces with empty string
  text = text.replace(/^\s*$/gm, '');

  //replace more then 2 new lines with 2 new lines
  text = text.replace(/\n{3,}/g, '\n\n');

  // Replace the new lines with a space
  text = text.replace(/([a-z,])\s*\n\n([a-z(])/g, '$1 $2');

  // replace the same but last and first character are asterisk following by a lowercase letter
  text = text.replace(/\*\n\n\*[a-z]/g, ' ');

  // replace 2 spaces with 1 space
  text = text.replace(/ {2,}/g, ' ');

  // replace empty lines between list items
  text = text.replace(/(\n\s*-\s*[^\n]*)(\n\s*\n)(?=\s*-\s*[^\n]*)/g, `$1\n`);
  text = text.replace(/(\n\s*-\s*[^\n]*)(\n\s*\n)(?=\s*-\s*[^\n]*)/g, `$1\n`);

  // replace all " :" with ":"
  text = text.replace(/ :/g, ":");

  // replace all " ." with "."
  text = text.replace(/ \./g, ".");

  // replace all "* *" or "** **" with ""
  text = text.replace(/\* \*|\*\* \*\*/g, "");

  // convert markdown symbols to markdown lists
  text = convertToMarkdownList(text);


  const links = extractMarkdownLinks(text);

  const groupedLinks = groupLinksByURL(links);

  const combinedLinks = combineLinkTexts(groupedLinks);

  let result = replaceSplitLinksWithCombined(text, links, combinedLinks);

  //replace more then 2 new lines with 2 new lines
  result = result.replace(/\n{3,}/g, '\n\n');

  return result;
}

function convertToMarkdownList(text: string): string {
  const lines = text.split('\n');
  let markdown = '';
  let currentIndent = 0;

  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('●')) {
      currentIndent = 0;
      markdown += `${'    '.repeat(currentIndent)}- ${trimmedLine.slice(1).trim()}\n`;
    } else if (trimmedLine.startsWith('○')) {
      currentIndent = 1;
      markdown += `${'    '.repeat(currentIndent)}- ${trimmedLine.slice(1).trim()}\n`;
    } else if (trimmedLine.startsWith('■')) {
      currentIndent = 2;
      markdown += `${'    '.repeat(currentIndent)}- ${trimmedLine.slice(1).trim()}\n`;
    } else {
      markdown += `${line}\n`;
    }
  });

  return markdown;
}

function replaceSplitLinksWithCombined(input: any, extractedLinks: any[], combinedLinks: { [x: string]: { fullMatch: any; }; }) {
  let result = input;

  // Track the positions to replace, and start replacing from the end to avoid index issues
  const sortedLinks = extractedLinks.sort((a, b) => a.start - b.start);

  let offset = 0;

  sortedLinks.forEach((link, index) => {
    const { url, fullMatch, start } = link;

    // Check if this link is the first occurrence of the URL's group in the sorted array
    if (combinedLinks[url]) {
      if (index === 0 || sortedLinks[index - 1].url !== url) {
        // Replace the first occurrence of the split links group with the combined link
        const combinedLink = combinedLinks[url].fullMatch;
        result =
          result.slice(0, start + offset) +
          combinedLink +
          result.slice(start + offset + fullMatch.length);

        // Update the offset based on the length difference
        offset += combinedLink.length - fullMatch.length;
      } else {
        // Remove subsequent occurrences of the same link URL group
        result =
          result.slice(0, start + offset) +
          result.slice(start + offset + fullMatch.length);

        // Update the offset to account for removed text
        offset -= fullMatch.length;
      }
    }
  });

  return result;
}

function extractMarkdownLinks(input: string): any[] {
  // Regular expression to match Markdown links
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let match;

  // Extract all Markdown links
  while ((match = regex.exec(input)) !== null) {
    links.push({
      fullMatch: match[0],  // Full link in Markdown format
      text: match[1],       // Link text
      url: match[2],        // Link URL
      start: match.index,   // Start index of the link in input
    });
  }

  return links;
}

function groupLinksByURL(links: any[]): any {
  const groupedLinks = {} as any;

  links.forEach(link => {
    if (!groupedLinks[link.url]) {
      groupedLinks[link.url] = [];
    }
    groupedLinks[link.url].push(link);
  });

  return groupedLinks;
}

function combineLinkTexts(groupedLinks: any): any {
  const combinedLinks = {} as any;

  Object.keys(groupedLinks).forEach(url => {
    const links = groupedLinks[url];

    if (links.length > 1) {
      // Combine texts if more than one link shares the same URL
      const combinedText = links.map((link: { text: any; }) => link.text).join(' ');
      combinedLinks[url] = {
        combinedText: combinedText,
        fullMatch: `[${combinedText}](${url})`
      };
    } else {
      // If there's only one link, keep it unchanged
      combinedLinks[url] = {
        combinedText: links[0].text,
        fullMatch: links[0].fullMatch
      };
    }
  });

  return combinedLinks;
}

export default MarkdownExtractor;
