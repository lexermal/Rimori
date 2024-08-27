import { CustomNavbar } from '@/components/startpage/Navbar';

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {

  return (
    <>
      <CustomNavbar />
      {children}
    </>
  );
}