import AppwriteService from '@/app/api/appwrite/documents/AppwriteConnector';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const db = AppwriteService.getInstance();

  try {
    const response = await db.addToWaitlist(email);
    return NextResponse.json({ success: true, data: response }, { status: 201 });
  } catch (error) {
    console.error('Failed to create document', error);
    return NextResponse.json({ error: 'Internal Server Error', details: (error as any).message }, { status: 500 });
  }
}