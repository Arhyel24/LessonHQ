"use client";

import { useSession } from "next-auth/react";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { CourseProgressSection } from "@/components/dashboard/CourseProgressSection";
import { AffiliateEarningsCard } from "@/components/dashboard/AffiliateEarningsCard";
import { QuickAccessSection } from "@/components/dashboard/QuickAccessSection";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { CertificatesSection } from "@/components/dashboard/CertificatesSection";

const Dashboard = () => {
  const { data: session, status } = useSession();
const fullName = session?.user?.name ?? "User";
const firstName = fullName.split(" ")[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeHeader userName={firstName} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Content - 2 columns on desktop */}
          <div className="lg:col-span-2 space-y-8">
            <CourseProgressSection />
            <QuickAccessSection />
            <CertificatesSection />
          </div>

          {/* Sidebar - 1 column on desktop */}
          <div className="space-y-8">
            <AffiliateEarningsCard />
            <RecentActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
