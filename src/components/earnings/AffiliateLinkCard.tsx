"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, Share2, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AffiliateLinkCardProps {
  AffiliateLink: string;
}

export const AffiliateLinkCard = ({
  AffiliateLink,
}: AffiliateLinkCardProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(AffiliateLink);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Your Affiliate link has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
      console.error("Failed to copy Affiliate link:", err);
    } finally {
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareWhatsApp = () => {
    const message = `Check out this amazing course platform! Join using my link and let's learn together: ${AffiliateLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        AffiliateLink
      )}`,
      "_blank"
    );
  };

  const shareTwitter = () => {
    const text = `Join me on this amazing learning platform! 🚀 #LearnHQCourse`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(AffiliateLink)}`,
      "_blank"
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-poppins text-lg flex items-center gap-2">
          <div className="bg-accent/20 p-2 rounded-lg">
            <Share2 className="h-5 w-5 text-accent" />
          </div>
          Your Affiliate Link
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Affiliate Link Input */}
        <div className="flex gap-2">
          <Input
            value={AffiliateLink}
            readOnly
            className="font-mono text-sm bg-gray-50"
          />
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="flex-shrink-0"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Helper Text */}
        <p className="font-nunito text-sm text-gray-600">
          Share this link with friends. You earn when they register and take a
          course!
        </p>

        {/* Social Share Buttons */}
        <div className="space-y-3">
          <p className="font-inter font-medium text-gray-900">
            Share on social media:
          </p>
          <div className="flex gap-3">
            <Button
              onClick={shareWhatsApp}
              variant="outline"
              className="flex-1 bg-green-50 border-green-200 hover:bg-green-100"
            >
              <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
              WhatsApp
            </Button>
            <Button
              onClick={shareFacebook}
              variant="outline"
              className="flex-1 bg-blue-50 border-blue-200 hover:bg-blue-100"
            >
              <Share2 className="w-4 h-4 mr-2 text-blue-600" />
              Facebook
            </Button>
            <Button
              onClick={shareTwitter}
              variant="outline"
              className="flex-1 bg-sky-50 border-sky-200 hover:bg-sky-100"
            >
              <Share2 className="w-4 h-4 mr-2 text-sky-600" />
              Twitter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
