import RootLayout from "@/app/RootLayout";
import { unstable_noStore as noStore } from 'next/cache';

export default function layout({ children }: { children: React.ReactNode }) {
  noStore();

  return <RootLayout
    allowedDomains={process.env.ALLOWED_DOMAINS?.split(",") || []}
    apiEndpoint={process.env.APPWRITE_API_ENDPOINT || ""}
    projectId={process.env.APPWRITE_PROJECT_ID || ""}
  >
    {children}
  </RootLayout>
}