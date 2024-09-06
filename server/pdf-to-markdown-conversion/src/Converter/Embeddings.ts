import OpenAI from "openai";
import { OPENAI_API_KEY } from "../utils/constants";


export async function getVectors(markdown: string): Promise<number[]> {
    // console.log("Generating embeddings for markdown: ", markdown)
    try {
        const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            // OpenAI recommends replacing newlines with spaces for best results (specific to embeddings)
            input: markdown.replace(/\n/g, ' ')
        })

        const enbeddings = embeddingResponse.data[0].embedding

        // console.log("embeddings for markdown: ", enbeddings)
        return enbeddings;
    } catch (err) {
        console.error(`Failed to generate embeddings for '${markdown}'`, err)
        return [];
    }
}