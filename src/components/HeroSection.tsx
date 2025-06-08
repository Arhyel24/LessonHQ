"use client";

import { Button } from "@/components/ui/button";
import myImageLoader from "@/lib/loader";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const HeroSection = () => {
  return (
    <section className="min-h-screen relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1551434678-e076c223a692?w=1920&h=1080&fit=crop&crop=center')",
        }}
      ></div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-blue-600/85 to-blue-800/90"></div>

      {/* Additional decorative overlays */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 pt-20 pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          <div className="space-y-8 animate-slide-in text-white">
            <h1 className="font-poppins font-bold text-4xl md:text-5xl lg:text-6xl leading-tight">
              Turn Your Phone Into a{" "}
              <span className="text-accent">Money-Making</span> Machine
            </h1>

            <p className="font-nunito text-lg md:text-xl text-blue-100 leading-relaxed">
              Learn affiliate marketing, design, and e-book publishing in simple
              steps. Start earning online today with proven strategies that work
              in Africa.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-inter font-semibold text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link href="/courses">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 bg-white border-white text-primary hover:bg-primary hover:text-white font-inter font-semibold text-lg px-8 py-6 rounded-xl transition-all duration-300 cursor-pointer"
                >
                  View Courses
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="text-center">
                <div className="font-poppins font-bold text-2xl text-accent">
                  5,000+
                </div>
                <div className="font-nunito text-sm text-blue-200">
                  Students
                </div>
              </div>
              <div className="text-center">
                <div className="font-poppins font-bold text-2xl text-accent">
                  3
                </div>
                <div className="font-nunito text-sm text-blue-200">Courses</div>
              </div>
              <div className="text-center">
                <div className="font-poppins font-bold text-2xl text-accent">
                  98%
                </div>
                <div className="font-nunito text-sm text-blue-200">
                  Success Rate
                </div>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-in">
            <div className="relative z-10">
              <Image
                src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=400&fit=crop&crop=center"
                alt="Person earning online with laptop"
                className="rounded-2xl shadow-2xl w-full max-w-lg mx-auto"
                loader={myImageLoader}
                width={600}
                height={400}
                quality={80}
              />
            </div>
            <div className="absolute -top-4 -right-4 w-full h-full bg-accent/20 rounded-2xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
