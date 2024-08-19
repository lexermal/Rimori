import StartPage from "@/components/startpage/Startpage";

import { unstable_noStore as noStore } from 'next/cache';

export default function Page() {
  noStore();

  return <StartPage uploadBackend={process.env.UPLOAD_BACKEND!} />
}