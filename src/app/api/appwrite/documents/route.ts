import SupabaseService from '@/app/api/opposition/Connector';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization');

  const db = new SupabaseService(token);

  try {
    const url = new URL(request.url);
    const documentId = new URLSearchParams(url.search).get('documentId');

    if (!documentId) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    const document = await db.getDocumentContent(documentId);

    console.log('Retrieved document', document);

    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error) {
    console.error('Failed to retrieve document', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

