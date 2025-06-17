"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { AffiliateDashboardData } from "@/types/earnings";
import { Users, DollarSign, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

const initialData: AffiliateDashboardData = {
  totalEarnings: 0,
  successfulAffiliates: 0,
  earningsThisMonth: 0,
  AffiliateLink: "",
  pendingAffiliates: 0,
  withdrawableBalance: 0,
  history: [],
};

export const AffiliateEarningsCard = () => {
  const [affiliateData, setAffiliateData] =
    useState<AffiliateDashboardData>(initialData);
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
        console.error("Failed to affiliate data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAffiliateData();
  }, []);

  const handleShare = async () => {
    if (!affiliateData.AffiliateLink) return;

    const referralLink = affiliateData.AffiliateLink;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join MIC and start earning!",
          text: "Start learning and earning with MIC. Use my referral link to sign up:",
          url: referralLink,
        });
        toast({
          title: "Link shared!",
          description: "Thanks for sharing your referral link.",
          variant: "success",
        });
      } catch (error) {
        toast({
          title: "Sharing cancelled",
          description: "You cancelled the share.",
          variant: "default",
        });
        console.log(error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(referralLink);
        toast({
          title: "Link copied!",
          description: "Your referral link has been copied to your clipboard.",
          variant: "success",
        });
      } catch (error) {
        toast({
          title: "Copy failed",
          description: "We couldn't copy the link. Try manually.",
          variant: "destructive",
        });
        console.log(error);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-poppins font-semibold text-lg text-gray-900">
          Affiliate Earnings
        </h2>
        <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-accent" />
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="bg-primary/5 rounded-lg p-4">
          <p className="font-nunito text-sm text-gray-600 mb-1">
            Total Earnings
          </p>
          <p className="font-poppins font-bold text-2xl text-primary">
            ₦{affiliateData.totalEarnings.toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-2">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <p className="font-inter font-semibold text-lg text-gray-900">
              {affiliateData.successfulAffiliates}
            </p>
            <p className="font-nunito text-xs text-gray-600">Affiliates</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <p className="font-inter font-semibold text-lg text-gray-900">
              ₦{affiliateData.earningsThisMonth.toLocaleString()}
            </p>
            <p className="font-nunito text-xs text-gray-600">This Month</p>
          </div>
        </div>
      </div>

      <Button
        onClick={handleShare}
        disabled={!affiliateData.AffiliateLink || loading}
        className="w-full bg-accent hover:bg-accent/90 text-gray-900 font-inter font-semibold disabled:opacity-50"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Invite Friends
      </Button>
    </div>
  );
};
