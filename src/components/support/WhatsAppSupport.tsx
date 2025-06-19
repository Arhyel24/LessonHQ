"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageCircle, ExternalLink } from "lucide-react";

export const WhatsAppSupport = () => {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      "Hi! I need help with my LearnHQ account. Can you assist me?"
    );
    const phoneNumber = process.env.PHONE_NUMBER;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-600" />
          <CardTitle className="font-poppins text-xl text-gray-900">
            Need immediate help?
          </CardTitle>
        </div>
        <CardDescription className="font-nunito">
          Chat with us directly on WhatsApp for faster support.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between md:flex-row flex-col gap-4">
          <div>
            <p className="font-nunito text-sm text-gray-600 mb-1">
              Available: Monday - Friday, 9am - 5pm WAT
            </p>
            <p className="font-nunito text-sm text-gray-600">
              Average response time: 5-10 minutes
            </p>
          </div>
          <Button
            onClick={handleWhatsAppClick}
            className="bg-green-600 hover:bg-green-700 text-white font-nunito font-medium"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat on WhatsApp
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
