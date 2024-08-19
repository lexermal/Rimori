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
  allowedDomains: string[];
  apiEndpoint: string,
  projectId: string
};

export default function RootLayout({ children, allowedDomains, apiEndpoint, projectId }: Props) {
  return (
    <html>
      <body>
        <GlobalProvider>
          <UserProvider allowedDomains={allowedDomains} apiEndpoint={apiEndpoint} projectId={projectId}>
            <CopilotKit url='/api/copilotkit/openai'>{children}</CopilotKit>
          </UserProvider>
        </GlobalProvider>
      </body>
    </html>
  );
}