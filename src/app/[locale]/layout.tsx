import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { CustomNavbar } from '@/components/startpage/Navbar';

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <title>Rimori</title>
        <link rel='icon' href='/favicon.ico' />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <CustomNavbar />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}