import LoginPage from "@/app/[locale]/(non-guard)/auth/login/LoginPage";
import { unstable_noStore as noStore } from 'next/cache';

export default function Page() {
  noStore();

  return <LoginPage />
}