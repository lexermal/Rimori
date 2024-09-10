import { unstable_noStore as noStore } from 'next/cache';

noStore();
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
if (!process.env.NEXT_PUBLIC_ALLOWED_DOMAINS) throw new Error('Missing env.NEXT_PUBLIC_ALLOWED_DOMAINS')
if (!process.env.NEXT_PUBLIC_UPLOAD_BACKEND) throw new Error('Missing env.NEXT_PUBLIC_UPLOAD_BACKEND')
if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) throw new Error('Missing env.NEXT_PUBLIC_ANTHROPIC_API_KEY')
if (!process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY) throw new Error('Missing env.NEXT_PUBLIC_ELEVENLABS_API_KEY')

export const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
export const NEXT_PUBLIC_ALLOWED_DOMAINS = process.env.NEXT_PUBLIC_ALLOWED_DOMAINS as string;
export const UPLOAD_BACKEND = process.env.NEXT_PUBLIC_UPLOAD_BACKEND as string;
export const NEXT_PUBLIC_ANTHROPIC_API_KEY = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY as string;
export const NEXT_PUBLIC_ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY as string;

