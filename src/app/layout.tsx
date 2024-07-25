'use client';
import { CopilotKit } from '@copilotkit/react-core';
import * as React from 'react';

import '@copilotkit/react-ui/styles.css';
import '@/styles/globals.css';
import '@/styles/colors.css';

import { GlobalProvider } from '@/context/GlobalContext';
import { UserProvider } from '@/context/UserContext';

import { CustomNavbar } from './go/components/Navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        <title>RIAU</title>
        <link rel='icon' href='/favicon.ico' />
      </head>
      <body>
        <CustomNavbar />
        <div className='h-28'>
        </div>

        <GlobalProvider>
          <UserProvider>
            <CopilotKit url='/api/copilotkit/openai'>{children}</CopilotKit>
          </UserProvider>
        </GlobalProvider>
      </body>
    </html>
  );
}
