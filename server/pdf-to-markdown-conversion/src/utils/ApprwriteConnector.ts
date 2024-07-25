import { Client, Databases, Storage, ID } from 'node-appwrite';

import { InputFile } from './tmp_InputFile';

class AppwriteService {
    private static instance: AppwriteService;
    private client: Client;
    private databases: Databases;
    private storage: Storage;
    private databaseId = process.env.APPWRITE_DATABASE_ID || 'database_id_is_missing';
    private collectionId = process.env.APPWRITE_DOCUMENT_COLLECTION_ID || 'document_collection_id_is_missing';
    private documentBucketId = process.env.APPWRITE_DOCUMENT_BUCKET_ID || 'document_bucket_id_is_missing';

    private constructor() {
        this.client = new Client();
        this.client
            .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
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

    public async createDocument(fileName: string): Promise<string> {
        const data = { status: "in_progress", name: fileName }
        return this.databases.createDocument(this.databaseId, this.collectionId, ID.unique(), data)
            .then(response => response.$id)
            .catch(error => {
                console.error('Error creating document:', error);
                throw error;
            });
    }

    public async updateDocument(documentId: string, content: string): Promise<any> {
        const data = { status: "completed", content }

        return this.databases.updateDocument(this.databaseId, this.collectionId, documentId, data)
            .then(response => response)
            .catch(error => {
                console.error('Error updating document:', error);
                throw error;
            });
    }

    public async uploadFile(filePath: string, fileName: string): Promise<any> {
        const file = InputFile.fromPath(filePath, fileName);
        return this.storage.createFile(this.documentBucketId, ID.unique(), file)
            .then(response => response)
            .catch(error => {
                console.error('Error uploading file:', error);
                throw error;
            });
    }
}

export default AppwriteService;
