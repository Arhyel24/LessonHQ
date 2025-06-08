import { ContactSupportForm } from "@/components/support/ContactSupportForm";
import { WhatsAppSupport } from "@/components/support/WhatsAppSupport";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "Help | MIC",
  description: "Get help or reach out to our support team",
};

export default function HelpPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4 space-y-12">
      <div>
        <Link href="/auth/signin" passHref>
          <Button variant="outline" size="sm">
            ← Back to Login
          </Button>
        </Link>
      </div>
      <section className="text-center space-y-4">
        <h1 className="text-3xl font-semibold">Need Help?</h1>
        <p className="text-gray-600">
          We&apos;re here to assist you. Reach out using the form or contact one
          of our support channels.
        </p>
      </section>

      <ContactSupportForm />
      <WhatsAppSupport />
    </main>
  );
}
