import fs from 'fs';
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL } from './constants';
import { createLogger } from './logger';

const logger = createLogger("ApprwriteConnector.ts");

class SupabaseService {
    private client: SupabaseClient;

    public constructor(bearerToken: string | null) {
        const token = (bearerToken ?? "").replace('Bearer ', '');
        this.client = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, { accessToken: async () => token });
    }

    public async createDocument(fileName: string): Promise<string> {
        const { error, data } = await this.client
            .from('documents')
            .insert({ name: fileName, status: 'in_progress', content: '' })
            .select();

        if (error) {
            logger.error('Failed to create document:', error);
            throw new Error('Failed to create document');
        }

        return (data![0] as any).id;
    }

    public async completeDocument(id: string, content: string): Promise<void> {
        const { error } = await this.client
            .from('documents')
            .update({ status: 'complete', content })
            .eq('id', id)

        if (error) {
            logger.error('Failed to update document:', error);
            throw new Error('Failed to update document');
        }
    }

    public async deleteDocument(id: string): Promise<void> {
        const { error } = await this.client.from('documents').delete().eq('id', id);

        if (error) {
            logger.error('Failed to delete document:', error);
            throw new Error('Failed to delete document');
        }
        logger.info('Document deleted successfully', id);
    }

    public async uploadAsset(filePath: string, fileName: string): Promise<any> {
        const fileBuffer = fs.readFileSync(filePath);

        const { data, error } = await this.client.storage
            .from("document_assets")
            .upload(fileName, fileBuffer, {
                cacheControl: '3600',
                upsert: false, // If true, it will overwrite the file if it exists
            });

        if (error) {
            logger.error('Error uploading file:', error.message);
        } else {
            logger.info('File uploaded successfully:', data.id);
        }
    }

    public async uploadDocument(filePath: string, fileName: string): Promise<void> {
        const fileBuffer = fs.readFileSync(filePath);

        const { data, error } = await this.client.storage
            .from("documents")
            .upload(fileName, fileBuffer, {
                cacheControl: '3600',
                upsert: false, // If true, it will overwrite the file if it exists
            });

        if (error) {
            logger.error('Error uploading file:', error.message);
        } else {
            logger.info('File uploaded successfully:', data.id);
        }
    }

    public async createDocumentSection(documentId: string, heading: string, headingLevel: number, content: string, vector: number[]): Promise<string> {
        const { error, data } = await this.client
            .from('document_section')
            .insert({ document_id: documentId, heading, heading_level: headingLevel, content, embedding: vector })
            .select();

        if (error) {
            console.error('Failed to create document section:', error.message);
            throw new Error('Failed to create document section');
        }

        return (data![0] as any).id;
    }
}

export default SupabaseService;

