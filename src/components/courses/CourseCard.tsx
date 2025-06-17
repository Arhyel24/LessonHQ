"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ICourseExtended } from "@/app/courses/page";

interface CourseCardProps {
  course: ICourseExtended;
  index: number;
}

export const CourseCard = ({ course, index }: CourseCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter()
  
  // Calculate animation delay based on index
  const animationDelay = `${index * 0.1}s`;

  const handleCardClick = () => {
    router.push(`/course/${course.slug}`);
  };
  
  return (
    <Card 
      className={`bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden animate-fade-in ${
        isHovered ? 'transform -translate-y-1' : ''
      } cursor-pointer group`}
      style={{ animationDelay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden">
        <Image 
          src={course.thumbnail} 
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          width={600}
          height={300}
          loader={({ src }) => src}
          quality={80}
        />
        <div className="absolute top-4 left-4 text-3xl bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-md">
          {course.icon}
        </div>
        
        {course.badge && (
          <Badge className="absolute top-4 right-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium">
            {course.badge}
          </Badge>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="font-poppins font-semibold text-xl text-gray-900">
            {course.title}
          </CardTitle>
        </div>
        <CardDescription className="font-nunito text-gray-600 line-clamp-2">
          {course.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center text-sm text-gray-500 mt-1 mb-4">
          <span className="mr-3">{course.difficulty}</span>
          <span className="mr-3">•</span>
          <span>{course.duration}</span>
        </div>

        {/* Pricing for non-enrolled courses */}
        {!course.isEnrolled && course.price && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl font-bold text-primary">
              ₦{course.price.toLocaleString()}
            </span>
            {course.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₦{course.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        )}
        
        {course.isEnrolled ? (
          <>
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-gray-700 font-medium">
                {course.progress === 100 ? 'Completed' : `${course.progress}% Complete`}
              </span>
            </div>
            <Progress 
              value={course.progress} 
              className="h-2 mb-4" 
            />
            <Button 
              className="w-full mt-2"
              variant={course.progress === 100 ? "outline" : "default"}
            >
              {course.progress === 100 ? 'Review Course' : course.progress > 0 ? 'Continue Learning' : 'Start Learning'}
            </Button>
          </>
        ) : (
          <Button className="w-full mt-4 cursor-pointer">
            View Course
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
