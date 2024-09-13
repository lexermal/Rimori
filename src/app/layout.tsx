import RootLayout from "@/app/RootLayout";
import { unstable_noStore as noStore } from 'next/cache';

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  ALLOWED_DOMAINS: string;
  UPLOAD_BACKEND: string;
  ANTHROPIC_API_KEY: string;
  ELEVENLABS_API_KEY: string;
  MATOMO_URL: string;
}

export default function layout({ children }: { children: React.ReactNode }) {
  noStore();
  const env: Env = {
    SUPABASE_URL: getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    SUPABASE_ANON_KEY: getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    ALLOWED_DOMAINS: getEnv('NEXT_PUBLIC_ALLOWED_DOMAINS'),
    UPLOAD_BACKEND: getEnv('NEXT_PUBLIC_UPLOAD_BACKEND'),
    ANTHROPIC_API_KEY: getEnv('NEXT_PUBLIC_ANTHROPIC_API_KEY'),
    ELEVENLABS_API_KEY: getEnv('NEXT_PUBLIC_ELEVENLABS_API_KEY'),
    MATOMO_URL: getEnv('NEXT_PUBLIC_MATOMO_URL'),
  }

  return <RootLayout env={env}>
    {children}
  </RootLayout>
}

function getEnv(name: string) {
  if (!process.env[name]) throw new Error(`Missing env.${name}`)
  return process.env[name] as string
}