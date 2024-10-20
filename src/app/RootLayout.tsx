'use client'
import { CopilotKit } from '@copilotkit/react-core';
import { ReactNode } from 'react';

import '@copilotkit/react-ui/styles.css';
import '@/styles/globals.css';
import '@/styles/colors.css';

import { GlobalProvider } from '@/context/GlobalContext';
import SupabaseProvider from '@/providers/SupabaseProvider';
import UserProvider from '@/providers/UserProvider';
import { EnvProvider } from '@/providers/EnvProvider';
import { Env } from '@/utils/constants';
import { SupabaseClient } from '@/utils/supabase/server';

type Props = {
  env: Env;
  children: ReactNode;
};

export default function RootLayout({ children, env }: Props) {
  SupabaseClient.getClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

  return (
    <GlobalProvider>
      <SupabaseProvider>
        <UserProvider>
          <EnvProvider env={env}>
            <CopilotKit url='/api/copilotkit/openai'>{children}</CopilotKit>
          </EnvProvider>
        </UserProvider>
      </SupabaseProvider>
    </GlobalProvider>
  );
}