"use client"

import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { CoursesSection } from "@/components/CoursesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { FAQSection } from "@/components/FAQSection";
import { CTAFooter } from "@/components/CTAFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <AboutSection />
      <CoursesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FAQSection />
      <CTAFooter />
    </div>
  );
};

export default Index;
