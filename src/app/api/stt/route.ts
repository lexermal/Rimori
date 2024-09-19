import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/utils/constants';
import { createLogger } from '@/utils/logger';

const logger = createLogger("POST /api/stt");

export async function POST(request: NextRequest) {
  const data = await request.formData()
  const file: File | null = data.get('file') as unknown as File

  if (!file) {
    logger.error('No file uploaded');
    return NextResponse.json({ error: 'No file uploaded' })
  }

  const formData = new FormData();
  formData.append('file', file, 'audio.wav');
  formData.append('model', 'whisper-1');

  return await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, },
    body: formData as unknown as BodyInit,
  })
    .then((res) => res.json())
    .then((data) => NextResponse.json({ text: data.text }))
    .catch((error) => {
      logger.error('Error when converting voice into audio: ', {error});
      return NextResponse.json({ success: false })
    });
}