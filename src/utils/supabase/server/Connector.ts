import NodeCache from 'node-cache';
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL } from '@/utils/constants';
import jwt from 'jsonwebtoken';
import { embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

class SupabaseService {
    private cache = new NodeCache();
    private client: SupabaseClient;
    private userID: string;

    public constructor(bearerToken: string | null) {
        const token = (bearerToken ?? "").replace('Bearer ', '');
        this.userID = jwt.decode(token)!.sub as string;

        if (!this.userID) {
            throw new Error('Failed to decode token');
        }

        this.client = createClient(
            NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY,
            { accessToken: async () => token });
    }

    public async verifyToken(): Promise<boolean> {
        return this.client.auth.getSession().then((session) => {
            console.log('Session:', session.data.session);
            return !!session.data.session;
        })
    }

    public async getDocumentContent(id: string): Promise<string> {
        const document = this.cache.get(id) as any | undefined;

        if (document) {
            console.log('Retrieving document from cache', this.userID);
            return document;
        }

        if (id.includes("_")) {
            const [fileid, sectionId] = id.split("_");
            const { data, error } = await this.client.rpc("get_section_details_by_heading", { p_heading_id: sectionId });

            if (error || !data) {
                console.error('Failed to retrieve document:', error);
                throw new Error('Failed to retrieve document');
            }

            // console.log('Retrieved document from database', data);
            const content = data.map((d: any) => d.content).join("\n\n");
            this.cache.set(id, content, 60 * 60 * 1);

            return content;
        }

        const { data, error } = await this.client.from('documents').select().eq('id', id);

        if (error || !data) {
            console.error('Failed to retrieve documents:', error);
            throw new Error('Failed to retrieve documents');
        }

        // console.log('Retrieved document from database', data[0]);

        const foundDocument = data[0].content;

        this.cache.set(id, foundDocument, 60 * 60 * 1);

        return foundDocument;
    }

    public async getSemanticDocumentSections(fileid: string, text: string): Promise<string> {
        //split with tentense end
        const embeddings = await this.getEmbedding(text.split(/(?<=[.?!])\s+/));
        // console.log('Embeddings:', embeddings);

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
                console.error('Failed to retrieve document sections:', error);
                throw new Error('Failed to retrieve document sections');
            }
            console.log('Retrieved document sections for embedding ' + index, data);

            return data;
        }));

        const sections = context.map((c: any) => c.map((s: any) => s.content)).flat()

        console.log('Retrieved document sections', sections);
        return sections.join("\n\n");
    }

    private async getEmbedding(sentences: string[]) {
        console.log('Generating embeddings for sentences:', sentences);
        const { embeddings } = await embedMany({
            model: openai.embedding('text-embedding-ada-002'),
            values: sentences
        });

        return embeddings;
    }
}

export default SupabaseService;
