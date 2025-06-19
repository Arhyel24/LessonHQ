import { Suspense } from "react";
import { LoadingScreen } from "@/components/loading-screen";
import EmailVerificationPage from "@/components/auth/EmailVerificationPage";

export default function AdminPageWithSuspense() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading verification page..." />}>
      {/* Suspense is used to handle loading states for the admin page */}
      <EmailVerificationPage />
    </Suspense>
  );
}
