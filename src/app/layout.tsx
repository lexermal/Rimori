'use client'
import { CopilotKit } from '@copilotkit/react-core';
import { ReactNode } from 'react';

import '@copilotkit/react-ui/styles.css';
import '@/styles/globals.css';
import '@/styles/colors.css';

import { GlobalProvider } from '@/context/GlobalContext';
import { UserProvider } from '@/context/UserContext';

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <GlobalProvider>
      <UserProvider>
        <CopilotKit url='/api/copilotkit/openai'>{children}</CopilotKit>
      </UserProvider>
    </GlobalProvider>
  );
}