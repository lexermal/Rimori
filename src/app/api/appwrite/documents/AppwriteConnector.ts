import jwt from 'jsonwebtoken';
import { Client, Databases, ID, Query, Storage } from 'node-appwrite';
import NodeCache from 'node-cache';
import { unstable_noStore as noStore } from 'next/cache';

noStore();

class AppwriteService {
    private static instance: AppwriteService;
    private client: Client;
    private databases: Databases;
    private storage: Storage;
    private databaseId = process.env.APPWRITE_DATABASE_ID || 'database_id_is_missing';
    private collectionId = process.env.APPWRITE_DOCUMENT_COLLECTION_ID || 'document_collection_id_is_missing';
    private documentBucketId = process.env.APPWRITE_DOCUMENT_BUCKET_ID || 'document_bucket_id_is_missing';
    private waitlistCollectionId = process.env.APPWRITE_WAITLIST_COLLECTION_ID || 'waitlist_collection_id_is_missing';
    private cache = new NodeCache();

    private constructor() {
        this.client = new Client();
        this.client
            .setEndpoint(process.env.APPWRITE_API_ENDPOINT || 'https://cloud.appwrite.io/v1')
            .setProject(process.env.APPWRITE_PROJECT_ID || 'project_id_is_missing')
            .setKey(process.env.APPWRITE_SECRET_KEY || 'secret_key_is_missing');

        this.databases = new Databases(this.client);
        this.storage = new Storage(this.client);
    }

    public static getInstance(): AppwriteService {
        if (!AppwriteService.instance) {
            AppwriteService.instance = new AppwriteService();
        }
        return AppwriteService.instance;
    }

    public async verifyToken(token: string): Promise<boolean> {
        try {
            const client = new Client()
                .setEndpoint(process.env.APPWRITE_API_ENDPOINT || 'https://cloud.appwrite.io/v1')
                .setProject(process.env.APPWRITE_PROJECT_ID || 'project_id_is_missing')
                .setJWT(token);

            const databases = new Databases(client);

            await databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [Query.equal('userId', "not an email")]
            );

            return true;
        } catch (error: any) {
            if (error.message === "Failed to verify JWT. Invalid token: Incomplete segments") {
                return false;
            }
            if (error.message === "The current user is not authorized to perform the requested action.") {
                return true;
            }
            //other errors
            console.error('Error verifying token:', error);
            return false;

        }
    }

    // public async createDocument(fileName: string, email: string): Promise<string> {
    //     const data = { status: "in_progress", name: fileName, email }
    //     return this.databases.createDocument(this.databaseId, this.collectionId, ID.unique(), data)
    //         .then(response => response.$id)
    //         .catch(error => {
    //             console.error('Error creating document:', error);
    //             throw error;
    //         });
    // }

    public async addToWaitlist(email: string): Promise<any> {
        return await this.databases.createDocument(
            this.databaseId,
            this.waitlistCollectionId,
            'unique()', // Unique document ID
            { email, createdAt: new Date().toISOString() }
        );
    }

    public async updateDocument(token: string, documentId: string, content: string): Promise<any> {
        return this.databases.updateDocument(this.databaseId, this.collectionId, documentId, { content })
            .then(response => {
                this.getDocuments(token, true);
                return response;
            })
            .catch(error => {
                console.error('Error updating document:', error);
                throw error;
            });
    }

    // public async uploadFile(filePath: string, fileName: string): Promise<any> {
    //     const file = InputFile.fromPath(filePath, fileName);
    //     return this.storage.createFile(this.documentBucketId, ID.unique(), file)
    //         .then(response => response)
    //         .catch(error => {
    //             console.error('Error uploading file:', error);
    //             throw error;
    //         });
    // }

    public async getDocuments(token: string, refresh?: boolean): Promise<any> {
        if (!await this.verifyToken(token)) {
            throw new Error('JWT token missing or ivalid.');
        }

        const userId = this.getUserId(token);
        const documents = this.cache.get(userId) as any | undefined;

        if (!refresh && documents) {
            return documents;
        }

        const docs = await this.databases.listDocuments(
            this.databaseId,
            this.collectionId,
            [Query.equal('userId', userId)]
        );

        console.log('Retrieving documents from cache', userId);

        this.cache.set(userId, documents, 60 * 60 * 1);

        return docs;
    }

    getUserId(token: string): string {
        const { userId } = jwt.decode(token) as { userId: string };
        return userId;
    }
}

export default AppwriteService;
