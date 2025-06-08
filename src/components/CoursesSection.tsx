"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import myImageLoader from "@/lib/loader";

export const CoursesSection = () => {
  const courses = [
    {
      title: "Affiliate Marketing",
      description:
        "Earn commissions by promoting products online without any upfront investment.",
      icon: "💰",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
    },
    {
      title: "Graphic Design",
      description:
        "Create stunning designs for clients worldwide using free tools and your creativity.",
      icon: "🎨",
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop",
    },
    {
      title: "E-book Publishing",
      description:
        "Write and publish profitable e-books on platforms like Amazon and earn passive income.",
      icon: "📚",
      image:
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop",
    },
  ];

  return (
    <section className="py-20 bg-gray-50" id="courses">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-gray-900 mb-4">
            Our <span className="text-primary">Income Courses</span>
          </h2>
          <p className="font-nunito text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our proven courses designed to help you start earning
            online quickly and effectively.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <Card
              key={course.title}
              className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in overflow-hidden group"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="relative overflow-hidden">
                <Image
                  src={course.image}
                  alt={course.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  width={192}
                  height={192}
                  loader={myImageLoader}
                  quality={80}
                />
                <div className="absolute top-4 left-4 text-3xl bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-md">
                  {course.icon}
                </div>
              </div>

              <CardHeader className="pb-4">
                <CardTitle className="font-poppins font-semibold text-xl text-gray-900">
                  {course.title}
                </CardTitle>
                <CardDescription className="font-nunito text-gray-600">
                  {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-inter font-medium rounded-lg py-6 transition-all duration-300">
                  View Course
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
