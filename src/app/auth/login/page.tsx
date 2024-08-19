import LoginPage from "@/app/auth/login/LoginPage";
import { unstable_noStore as noStore } from 'next/cache';

export default function Page() {
  noStore();
  
  return <LoginPage
    apiEndpoint={process.env.APPWRITE_API_ENDPOINT!}
    frontendUrl={process.env.FRONTEND_DOMAIN!}
    projectId={process.env.APPWRITE_PROJECT_ID!}
  />
}