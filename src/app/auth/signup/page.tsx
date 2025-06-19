import { Suspense } from "react";
import { LoadingScreen } from "@/components/loading-screen";
import SignupPage from "@/components/auth/signupPage";

export default function AdminPageWithSuspense() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading signup page..." />}>
      {/* Suspense is used to handle loading states for the admin page */}
      <SignupPage />
    </Suspense>
  );
}
