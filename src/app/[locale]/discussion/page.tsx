import Discussion from "@/app/[locale]/discussion/Discussion";

import { unstable_noStore as noStore } from 'next/cache';

export default function Page() {
  noStore();

  return <Discussion ttsAPIkey={process.env.ELEVENLABS_API_KEY!} />
}