"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export const CTAFooter = () => {
  const router = useRouter();

  return (
    <div className="mt-16 mb-8 text-center">
      <div className="bg-primary/5 rounded-xl p-8 max-w-3xl mx-auto">
        <h3 className="font-poppins font-bold text-2xl text-gray-900 mb-4">
          Ready to Start Your First Lesson?
        </h3>
        <p className="font-nunito text-gray-600 mb-6 max-w-xl mx-auto">
          Our step-by-step courses will guide you from beginner to expert, with
          practical lessons you can apply immediately to start earning.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={() => router.push("/dashboard")} className="px-6">
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Explore Courses
          </Button>
        </div>
      </div>
    </div>
  );
};
