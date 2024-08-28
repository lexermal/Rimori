import { NextRequest, NextResponse } from 'next/server';

import SupaBaseService from '@/app/api/appwrite/documents/AppwriteConnector';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization');

  const db = new SupaBaseService(token);

  if (!await db.verifyToken()) {
    return NextResponse.json({ error: 'JWT token missing or invalid' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const documentId = new URLSearchParams(url.search).get('documentId');

    if (!documentId) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    const { document } = await db.getDocument(documentId);

    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error) {
    console.error('Failed to retrieve document', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

