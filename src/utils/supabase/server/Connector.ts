import NodeCache from 'node-cache';
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL } from '@/utils/constants';
import jwt from 'jsonwebtoken';

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

        this.client = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, { accessToken: async () => token });
    }

    public async verifyToken(): Promise<boolean> {
        return this.client.auth.getSession().then((session) => {
            console.log('Session:', session.data.session);
            return !!session.data.session;
        })
    }

    public async getDocument(id: string): Promise<any> {
        const document = this.cache.get(id) as any | undefined;

        if (document) {
            console.log('Retrieving document from cache', this.userID);
            return document;
        }

        const { data, error } = await this.client.from('documents').select().eq('id', id);

        if (error || !data) {
            console.error('Failed to retrieve documents:', error);
            throw new Error('Failed to retrieve documents');
        }

        const foundDocument = data[0];

        this.cache.set(id, foundDocument, 60 * 60 * 1);

        return foundDocument;
    }
}

export default SupabaseService;
