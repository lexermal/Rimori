import { NextRequest, NextResponse } from 'next/server';

import { databases } from '@/app/appwrite';

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const response = await databases.createDocument(
      '66a11fc7003aff280a27', // Replace with your database ID
      '66afc68e000ddc0625bc', // Replace with your collection ID
      'unique()', // Unique document ID
      { email, createdAt: new Date().toISOString() }
    );
    return NextResponse.json({ success: true, data: response }, { status: 201 });
  } catch (error) {
    console.error('Failed to create document', error);
    return NextResponse.json({ error: 'Internal Server Error', details: (error as any).message }, { status: 500 });
  }
}