import { Suspense } from "react";
import AdminPage from "@/components/admin/AdminPage"; // Moved logic here
import { LoadingScreen } from "@/components/loading-screen";

export default function AdminPageWithSuspense() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading admin dashboard..." />}>
      {/* Suspense is used to handle loading states for the admin page */}
      <AdminPage />
    </Suspense>
  );
}
