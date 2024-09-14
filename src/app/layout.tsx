import RootLayout from "@/app/RootLayout";
import { env } from "@/utils/constants";
import { SupabaseClient } from "@/utils/supabase/server";
import { unstable_noStore as noStore } from 'next/cache';

export default function layout({ children }: { children: React.ReactNode }) {
  noStore();
  SupabaseClient.getClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

  return <RootLayout env={env}>
    {children}
  </RootLayout>
}