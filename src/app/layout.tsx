import RootLayout from "@/app/RootLayout";
import { env } from "@/utils/constants";
import { unstable_noStore as noStore } from 'next/cache';

export default function layout({ children }: { children: React.ReactNode }) {
  noStore();

  return <RootLayout env={env}>
    {children}
  </RootLayout>
}