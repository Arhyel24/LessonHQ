"use client";

import { AffiliateEarningsCard } from "@/components/dashboard/AffiliateEarningsCard";
import { AffiliateLinkCard } from "@/components/earnings/AffiliateLinkCard";
import { AffiliateHistoryTable } from "@/components/earnings/AffiliateHistoryTable";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { AffiliateDashboardData } from "@/types/earnings";
import { useEffect, useState } from "react";
import { LoadingScreen } from "@/components/loading-screen";

const Earnings = () => {
  const [affiliateData, setAffiliateData] =
    useState<AffiliateDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAffiliateData = async () => {
      try {
        const res = await fetch("/api/referral/earnings");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to fetch referral data");
        }

        setAffiliateData(json.data);
      } catch (error) {
        console.error("Failed to fetch earnings data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAffiliateData();
  }, []);

  const scrollToAffiliateLink = () => {
    document.getElementById("Affiliate-link-section")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  if (loading || !affiliateData)
    return <LoadingScreen message="Loading earnings..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="font-poppins font-bold text-3xl text-gray-900 mb-2">
            Affiliate Dashboard
          </h1>
          <p className="font-nunito text-lg text-gray-600">
            Earn while you learn — invite friends and get rewarded!
          </p>
        </div>

        {/* Main Content Grid - Fixed mobile layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Summary Card */}
          <div className="lg:col-span-1 w-full">
            <AffiliateEarningsCard />
          </div>

          {/* Right Column - Affiliate Link */}
          <div className="lg:col-span-2 w-full" id="Affiliate-link-section">
            <AffiliateLinkCard AffiliateLink={affiliateData.AffiliateLink} />
          </div>
        </div>

        {/* Affiliate History */}
        <div className="mb-8">
          <AffiliateHistoryTable history={affiliateData.history} />
        </div>

        {/* Call to Action */}
        <div className="bg-primary/5 rounded-xl p-6 text-center">
          <h3 className="font-poppins font-semibold text-xl text-gray-900 mb-2">
            Want to boost your earnings?
          </h3>
          <p className="font-nunito text-gray-600 mb-4">
            Share your Affiliate link and start earning more today!
          </p>
          <Button
            onClick={scrollToAffiliateLink}
            className="bg-primary hover:bg-primary/90 text-white font-inter font-semibold"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Invite More Friends
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
