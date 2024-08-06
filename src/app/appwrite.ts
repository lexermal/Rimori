import { Account, Client, Databases } from 'appwrite';

const client = new Client().setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_API_ENDPOINT as string).setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string);
const account = new Account(client);
const databases = new Databases(client);

export { account, client, databases };

export { ID } from "appwrite";