import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import NodeCache from 'node-cache';

import AppwriteService from '@/app/api/appwrite/documents/AppwriteConnector';


const cache = new NodeCache();
const db = AppwriteService.getInstance();

export async function POST(request: NextRequest) {
  let token = request.headers.get('Authorization');
  if (!token) {
    return NextResponse.json({ error: 'JWT token missing' }, { status: 401 });
  }

  token = token.replace('Bearer ', '');

  try {
    if (!jwt.verify(token, process.env.JWT_SECRET!)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { email } = jwt.decode(token) as { email: string };

    let documents = cache.get(email) as any | undefined;
    if (!documents) {
      documents = (await db.getDocuments(email)).documents;

      console.log('Retrieving documents for cache', email);

      cache.set(email, documents, 30 * 60);
    }

    const { documentId, onlyTitle } = await request.json().catch(() => ({}));

    if (documentId) {
      const document = documents.find((doc: any) => doc.$id === documentId);
      if (!document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: [document] }, { status: 201 });
    }

    if (onlyTitle) {
      const titles = documents.map((doc: any) => ({ $id: doc.$id, name: doc.name }));
      return NextResponse.json({ success: true, data: titles }, { status: 201 });
    }

    return NextResponse.json({ success: true, data: documents }, { status: 201 });
  } catch (error) {
    console.error('Failed to retrieve document', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
