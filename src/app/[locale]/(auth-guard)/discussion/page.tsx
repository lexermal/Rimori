import Discussion from "@/app/[locale]/(auth-guard)/discussion/Discussion";
import { NEXT_PUBLIC_ELEVENLABS_API_KEY } from "@/utils/constants";

import { unstable_noStore as noStore } from 'next/cache';

export default function Page() {
  noStore();

  return <Discussion ttsAPIkey={NEXT_PUBLIC_ELEVENLABS_API_KEY} />
}