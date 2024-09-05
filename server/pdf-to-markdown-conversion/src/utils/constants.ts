import { unstable_noStore as noStore } from 'next/cache';

noStore();
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
if (!process.env.ASSET_PATH) throw new Error('Missing env.ASSET_PATH')
if (!process.env.FRONTEND_DOMAIN) throw new Error('Missing env.FRONTEND_DOMAIN')
if (!process.env.OPENAI_API_KEY) throw new Error('Missing env.OPENAI_API_KEY')

export const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
export const ASSET_PATH = process.env.ASSET_PATH as string;
export const FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN as string;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;


