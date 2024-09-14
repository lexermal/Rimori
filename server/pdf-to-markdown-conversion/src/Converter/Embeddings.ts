import OpenAI from "openai";
import { OPENAI_API_KEY } from "../utils/constants";
import { createLogger } from "../utils/logger";

const logger = createLogger("Embeddings.ts");

export async function getVectors(markdown: string): Promise<number[]> {
    try {
        const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            // OpenAI recommends replacing newlines with spaces for best results (specific to embeddings)
            input: markdown.replace(/\n/g, ' ')
        })

        const enbeddings = embeddingResponse.data[0].embedding

        logger.info("Created embedding")
        return enbeddings;
    } catch (err) {
        logger.error(`Failed to generate embeddings for '${markdown}'`, {error: err})
        return [];
    }
}