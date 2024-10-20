import SupabaseService from '@/app/api/opposition/Connector';
import { createLogger } from '@/utils/logger';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const logger = createLogger("GET /api/appwrite/documents");
  logger.warn("Endpoint is deprecated but still got called", { request_headers: request.headers });

  const token = request.headers.get('Authorization');

  const db = new SupabaseService(token);

  try {
    const url = new URL(request.url);
    const documentId = new URLSearchParams(url.search).get('documentId');

    if (!documentId) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    const document = await db.getDocumentContent(documentId);

    logger.info('Retrieved document', { document });

    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error) {
    logger.error('Failed to retrieve document', { error });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

