"use client"

import { useState } from "react";
import { Search, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FAQSection } from "@/components/support/FAQSection";
import { ContactSupportForm } from "@/components/support/ContactSupportForm";
import { WhatsAppSupport } from "@/components/support/WhatsAppSupport";

const Support = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h1 className="font-poppins font-bold text-3xl text-gray-900">
              Support Center
            </h1>
          </div>
          <p className="font-nunito text-lg text-gray-600">
            Need help? We&apos;re here for you.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for a topic or question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        {/* FAQ Section */}
        <FAQSection searchQuery={searchQuery} />

        {/* Contact Support */}
        <div className="space-y-8">
          <ContactSupportForm />

          {/* WhatsApp Support */}
          <WhatsAppSupport />
        </div>
      </div>
    </div>
  );
};

export default Support;
