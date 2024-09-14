import { createLogger } from "./logger";

export interface Section {
    heading: string;
    level: number;
    markdown: string;
    documentPosition: number;
}

const logger = createLogger("HeadingSplitter.ts");

export async function getMarkdownSections(markdown: string): Promise<Section[]> {
    const sections: Section[] = [];
    const regex = /^(#{1,6})\s+(.*)$/gm;
    let match;

    while ((match = regex.exec(markdown)) !== null) {
        const level = match[1].length;
        const heading = match[2].trim();
        const startIndex = match.index;
        const endIndex = getNextHeadingIndex(markdown, regex.lastIndex);

        const sectionMarkdown = markdown.substring(startIndex, endIndex).trim();

        if (isRealHeading(heading)) {
            const section: Section = {
                heading: cleanHeading(heading),
                level,
                markdown: sectionMarkdown,
                documentPosition: sections.length + 1,
            };

            sections.push(section);
        }
    }
    logger.info(`Found ${sections.length} sections in markdown`);

    return sections;
}

function getNextHeadingIndex(markdown: string, currentIndex: number): number {
    const regex = /^(#{1,6})\s+/gm;
    regex.lastIndex = currentIndex;
    const match = regex.exec(markdown);
    return match ? match.index : markdown.length;
}

function isRealHeading(str: string): boolean {
    return str.match(/[a-z0-9]/i) !== null;
}

function cleanHeading(heading: string): string {
    // remove * from heading
    heading = heading.replace(/\*/g, "");

    // check if heading is a markdown link and extract the link text
    const linkMatch = heading.match(/\[(.*)\]/);
    if (linkMatch) {
        heading = linkMatch[1];
    }

    return heading;
}