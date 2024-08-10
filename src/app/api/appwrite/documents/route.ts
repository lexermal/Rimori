import { NextRequest, NextResponse } from 'next/server';

import AppwriteService from '@/app/api/appwrite/documents/AppwriteConnector';


const db = AppwriteService.getInstance();

export async function GET(request: NextRequest) {
  let token = request.headers.get('Authorization');
  if (!token) {
    return NextResponse.json({ error: 'JWT token missing' }, { status: 401 });
  }

  token = token.replace('Bearer ', '');

  try {
    const documents = (await db.getDocuments(token)).documents;

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
