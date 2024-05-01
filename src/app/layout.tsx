'use client';
import { CopilotKit } from '@copilotkit/react-core';
import * as React from 'react';

import '@copilotkit/react-ui/styles.css';
import '@/styles/globals.css';
import '@/styles/colors.css';

import { GlobalProvider } from '@/components/GlobalContext';
import { CustomNavbar } from './go/components/Navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <CustomNavbar />
        <div className='h-28'>
          </div>

        <GlobalProvider>
          <CopilotKit url='/api/copilotkit/openai'>{children}</CopilotKit>
        </GlobalProvider>
      </body>
    </html>
  );
}
