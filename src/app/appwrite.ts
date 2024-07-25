import { Account, Client } from 'appwrite';

export const client = new Client();
client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_API_ENDPOINT as string).setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string);


export const account = new Account(client);

export { ID } from "appwrite";