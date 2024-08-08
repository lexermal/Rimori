import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import NodeCache from 'node-cache';

import AppwriteService from '@/app/api/appwrite/documents/AppwriteConnector';


const cache = new NodeCache();
const db = AppwriteService.getInstance();

export async function GET(request: NextRequest) {
  let token = request.headers.get('Authorization');
  if (!token) {
    return NextResponse.json({ error: 'JWT token missing' }, { status: 401 });
  }

  token = token.replace('Bearer ', '');

  try {
    const jwtValid = await db.verifyToken(token);
    // console.log('JWT valid:', jwtValid);
    if (!jwtValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { userId } = jwt.decode(token) as { userId: string };
    console.log('User ID:', userId);

    let documents = cache.get(userId) as any | undefined;
    if (!documents) {
      documents = (await db.getDocuments(userId)).documents;

      console.log('Retrieving documents for cache', userId);

      cache.set(userId, documents, 2 * 60);
    }

    const url = new URL(request.url);
    const params = new URLSearchParams(url.search);
    const { documentId, onlyTitle } = Object.fromEntries(params.entries());;

    if (documentId) {
      const document = documents.find((doc: any) => doc.$id === documentId);
      if (!document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: [document] }, { status: 201 });
    }

    if (onlyTitle) {
      const titles = documents.map((doc: any) => ({ id: doc.$id, name: doc.name }));
      return NextResponse.json({ success: true, data: titles }, { status: 201 });
    }

    return NextResponse.json({ success: true, data: documents }, { status: 201 });
  } catch (error) {
    console.error('Failed to retrieve document', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
