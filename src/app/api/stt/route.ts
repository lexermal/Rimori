import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const data = await request.formData()
  const file: File | null = data.get('file') as unknown as File

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' })
  }

  const formData = new FormData();
  formData.append('file', file, 'audio.wav');
  formData.append('model', 'whisper-1');

  return await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, },
    body: formData as unknown as BodyInit,
  })
    .then((res) => res.json())
    .then((data) => NextResponse.json({ text: data.text }))
    .catch((err) => {
      console.log('error when converting voice into audio: ', err);
      return NextResponse.json({ success: false })
    });
}