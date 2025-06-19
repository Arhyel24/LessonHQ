"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import myImageLoader from "@/lib/loader";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Okafor",
      role: "Affiliate Marketer",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face",
      quote:
        "MIC changed my life! I now earn $500+ monthly through affiliate marketing while still in university.",
    },
    {
      name: "James Mwangi",
      role: "Graphic Designer",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
      quote:
        "The graphic design course taught me everything I needed. I now have 20+ regular clients!",
    },
    {
      name: "Fatima Hassan",
      role: "Author",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
      quote:
        "Published 3 e-books using MIC strategies. My passive income grows every month!",
    },
    {
      name: "David Osei",
      role: "Digital Entrepreneur",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      quote:
        "Started with zero experience. Now I run multiple income streams thanks to MIC's training.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, [nextTestimonial]);

  return (
    <section className="py-20 bg-gray-50" id="testimonials">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-gray-900 mb-4">
            Success <span className="text-primary">Stories</span>
          </h2>
          <p className="font-nunito text-lg text-gray-600 max-w-2xl mx-auto">
            Hear from our students who are now earning online
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.name}
              className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                    width={16}
                    height={16}
                    loader={myImageLoader}
                    quality={75}
                  />
                  <div>
                    <div className="font-poppins font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="font-nunito text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <p className="font-nunito text-gray-700 italic">
                  {`"${testimonial.quote}"`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].name}
                  className="w-16 h-16 rounded-full object-cover"
                  width={16}
                  height={16}
                  loader={myImageLoader}
                  quality={75}
                />
                <div>
                  <div className="font-poppins font-semibold text-gray-900 text-lg">
                    {testimonials[currentIndex].name}
                  </div>
                  <div className="font-nunito text-gray-600">
                    {testimonials[currentIndex].role}
                  </div>
                </div>
              </div>
              <p className="font-nunito text-gray-700 italic text-lg leading-relaxed">
                {`"${testimonials[currentIndex].quote}"`}
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={prevTestimonial}
              className="rounded-full w-10 h-10 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? "bg-primary" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={nextTestimonial}
              className="rounded-full w-10 h-10 p-0"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
