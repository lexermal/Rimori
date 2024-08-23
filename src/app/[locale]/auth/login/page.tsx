import LoginPage from "@/app/[locale]/auth/login/LoginPage";
import { unstable_noStore as noStore } from 'next/cache';

export default function Page() {
  noStore();

  return <LoginPage />
}