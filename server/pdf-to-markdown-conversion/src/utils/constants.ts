if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
if (!process.env.FRONTEND_DOMAIN) throw new Error('Missing env.FRONTEND_DOMAIN')
if (!process.env.CONVERTING_ANTHROPIC_API_KEY) throw new Error('Missing env.CONVERTING_ANTHROPIC_API_KEY')
if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) throw new Error('Missing env.NEXT_PUBLIC_OPENAI_API_KEY')
if (!process.env.NEXT_PUBLIC_LOGGING_BACKEND_URL) throw new Error('Missing env.NEXT_PUBLIC_LOGGING_BACKEND_URL')
if (!process.env.NEXT_PUBLIC_LOGGING_USERNAME) throw new Error('Missing env.NEXT_PUBLIC_LOGGING_USERNAME')
if (!process.env.NEXT_PUBLIC_LOGGING_PASSWORD) throw new Error('Missing env.NEXT_PUBLIC_LOGGING_PASSWORD')
if (!process.env.SKIPPING_AI_OPTIMIZATION) throw new Error('Missing env.SKIPPING_AI_OPTIMIZATION')

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
export const FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN as string;
export const ANTHROPIC_API_KEY = process.env.CONVERTING_ANTHROPIC_API_KEY as string;
export const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY as string;
export const LOGGING_BACKEND_URL = process.env.NEXT_PUBLIC_LOGGING_BACKEND_URL as string;
export const LOGGING_USERNAME = process.env.NEXT_PUBLIC_LOGGING_USERNAME as string;
export const LOGGING_PASSWORD = process.env.NEXT_PUBLIC_LOGGING_PASSWORD as string;
export const SKIPPING_AI_OPTIMIZATION = process.env.SKIPPING_AI_OPTIMIZATION.toLowerCase() === 'true';
