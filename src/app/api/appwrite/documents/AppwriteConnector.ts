import NodeCache from 'node-cache';
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL } from '@/utils/constants';

class AppwriteService {
    private cache = new NodeCache();
    private client: SupabaseClient;

    public constructor(bearerToken: string | null) {
        const token = (bearerToken ?? "").replace('Bearer ', '');
        this.client = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, { accessToken: async () => token });
    }

    public async verifyToken(): Promise<boolean> {
        return this.client.auth.getSession().then((session) => {
            console.log('Session:', session.data.session);
            return !!session.data.session;
        })
    }

    public async getDocument(id: string): Promise<any> {
        if (!await this.verifyToken()) throw new Error('WT token missing or ivalid.')

        const { data: userData } = await this.client.auth.getUser();
        console.log('userData:', userData);

        const userId = userData.user!.id;
        const document = this.cache.get(userId + "_" + id) as any | undefined;

        if (document) {
            return document;
        }

        const { data, error } = await this.client.from('documents').select('*').eq('id', id);

        if (error || !data) {
            console.error('Failed to retrieve documents:', error);
            throw new Error('Failed to retrieve documents');
        }

        console.log('Retrieving document from cache', userId);
        const foundDocument = data[1];

        this.cache.set(userId + "_" + id, foundDocument, 60 * 60 * 1);

        return foundDocument;
    }
}

export default AppwriteService;
