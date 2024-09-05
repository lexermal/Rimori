export interface Section {
    heading: string;
    level: number;
    markdown: string;
    documentPosition: number;
}

export async function getMarkdownSections(markdown: string): Promise<Section[]> {
    // console.log("markdown: ", markdown);
    const sections: Section[] = [];
    const regex = /^(#{1,6})\s+(.*)$/gm;
    let match;

    while ((match = regex.exec(markdown)) !== null) {
        const level = match[1].length;
        const heading = match[2].trim();
        const startIndex = match.index;
        const endIndex = getNextHeadingIndex(markdown, regex.lastIndex);

        const sectionMarkdown = markdown.substring(startIndex, endIndex).trim();

        // console.log("sectionMarkdown: ", sectionMarkdown);

        if (isRealHeading(heading)) {
            const section: Section = {
                heading,
                level,
                markdown: sectionMarkdown,
                documentPosition: sections.length + 1,
            };

            // console.log("section: ", section)
            sections.push(section);
        }
    }

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