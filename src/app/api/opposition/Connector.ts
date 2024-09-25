import NodeCache from 'node-cache';
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from '@/utils/constants';
import jwt from 'jsonwebtoken';
import { embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createLogger } from '@/utils/logger';

const logger = createLogger("SupabaseService");

class SupabaseService {
    private cache = new NodeCache();
    private client: SupabaseClient;
    private userID: string;

    public constructor(bearerToken: string | null) {
        const token = (bearerToken ?? "").replace('Bearer ', '');
        this.userID = jwt.decode(token)!.sub as string;

        if (!this.userID) {
            console.error('Failed to decode token', { token });
            throw new Error('Failed to decode token');
        }

        this.client = createClient(
            env.SUPABASE_URL,
            env.SUPABASE_ANON_KEY,
            { accessToken: async () => token });
    }

    public async verifyToken(): Promise<boolean> {
        return this.client.auth.getSession().then((session) => {
            console.log('Session:', session.data.session);
            return !!session.data.session;
        }).catch((error) => {
            console.error('Failed to verify token:', error);
            return false;
        });
    }

    public async getDocumentContent(id: string): Promise<string> {
        const document = this.cache.get(id) as any | undefined;

        if (document) {
            logger.info('Retrieving document from cache', { id });
            return document;
        }

        if (id.includes("_")) {
            logger.info("The document id contains a section id, fetching section details", { id });

            const [fileid, sectionId] = id.split("_");
            const { data, error } = await this.client.rpc("get_section_details_by_heading", { p_heading_id: sectionId });

            if (error || !data) {
                logger.error('Failed to retrieve document:', { error });
                throw new Error('Failed to retrieve document');
            }

            const content = data.map((d: any) => d.content).join("\n\n");

            logger.info("Adding document to cache", { id });
            this.cache.set(id, content, 60 * 60 * 1);

            return content;
        }

        const { data, error } = await this.client.from('documents').select().eq('id', id);

        if (error || !data) {
            logger.error('Failed to retrieve documents:', { error });
            throw new Error('Failed to retrieve documents');
        }

        logger.info('Retrieved document from database', { id });

        const foundDocument = data[0].content;

        logger.info('Adding document to cache', { id });
        this.cache.set(id, foundDocument, 60 * 60 * 1);

        return foundDocument;
    }

    public async getSemanticDocumentSections(fileid: string, text: string): Promise<string> {
        //split with tentense end
        const embeddings = await this.getEmbedding(text.split(/(?<=[.?!])\s+/));
        // console.log('Embeddings:', embeddings);

        logger.info("Starting to retrieve semantic document sections", { fileid });
        const context = await Promise.all(embeddings.map(async (embedding: any, index: number) => {
            const { error, data } = await this.client.rpc(
                "match_document_sections", {
                embedding,
                search_document: fileid,
                match_threshold: 0.78,
                match_count: 5,
                min_content_length: 50,
            });

            if (error) {
                logger.error('Failed to retrieve document sections:', { error });
                throw new Error('Failed to retrieve document sections');
            }
            logger.info('Retrieved document sections for embedding ' + index);

            return data;
        }));

        const sections = context.map((c: any) => c.map((s: any) => s.content)).flat()

        logger.info('Retrieved document sections');
        return sections.join("\n\n");
    }

    private async getEmbedding(sentences: string[]) {
        logger.debug('Generating embeddings for sentences:', { sentences });
        const { embeddings } = await embedMany({
            model: openai.embedding('text-embedding-ada-002'),
            values: sentences
        }).catch((error) => {
            logger.error('Failed to generate embeddings:', { error });
            throw new Error('Failed to generate embeddings');
        });

        return embeddings;
    }
}

export default SupabaseService;
