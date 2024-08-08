import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { CustomNavbar } from '@/app/[locale]/go/components/Navbar';

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
  console.log('Locale layout 1st')

  return (
    <html lang={locale}>
      <head>
        <title>RIAU</title>
        <link rel='icon' href='/favicon.ico' />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <CustomNavbar />
          <div className='h-28'>
          </div>

          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}