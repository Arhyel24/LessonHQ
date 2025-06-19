"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Users, Star, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ICourseTransformed } from "@/types/Course";

const CourseDetail = () => {
  const { slug } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState<ICourseTransformed | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/course/getbyslug/${slug}`);
        if (!res.ok) throw new Error("Not found");

        const json = await res.json();
        if (!json.data) throw new Error("No course data");

        console.log("Course data:", json);

        setCourse(json.data);
      } catch (error) {
        console.error("Error loading course:", error);
        setError("Error loading courses, please reload or go back");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug, router]);

  const getActionButtonText = () => {
    if (!course?.isEnrolled) return "Enroll Now";
    if (course.progress === 100) return "Review Course";
    return course.progress > 0 ? "Continue Learning" : "Start Learning";
  };

  const handleButtonClick = () => {
    if (!course?.isEnrolled) {
      router.push(`/course/${slug}/payment`);
    } else {
      router.push(`/course/${slug}/lesson`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading course details...
      </div>
    );
  }

  if (!course) return null; // Shouldn't reach here, but just in case

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Oops!</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="flex gap-4">
          <Button
            onClick={() => router.refresh()}
            className="bg-secondary text-white"
          >
            Refresh
          </Button>
          <Button
            onClick={() => router.push("/courses")}
            className="bg-primary text-white"
          >
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/courses")}
            className="flex items-center gap-2 text-gray-600 hover:text-primary mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Hero */}
            <div className="relative rounded-xl overflow-hidden mb-8">
              <Image
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-64 md:h-80 object-cover"
                width={800}
                height={400}
                loader={({ src, width, quality }) =>
                  `${src}?w=${width}&q=${quality || 75}`
                }
                quality={80}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <div className="text-white">
                  <div className="flex items-center mb-3">
                    <span className="text-4xl mr-4">{course.icon}</span>
                    {course.badge && (
                      <Badge className="bg-yellow-400 hover:bg-yellow-400 text-gray-900">
                        {course.badge}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {course.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {course.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.students
                        ? course?.students.toLocaleString()
                        : "No"}{" "}
                      students
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.duration}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-700">
                    {course.difficulty}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="font-medium text-gray-700">
                    Instructor: {course.instructor}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                {course.description}
              </p>

              {course.isEnrolled && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">
                      {course.progress === 100
                        ? "Completed"
                        : `${course.progress}% Complete`}
                    </span>
                  </div>
                  <Progress value={course.progress} className="h-3" />
                </div>
              )}
            </div>

            {/* Course Modules */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-xl mb-6">Course Modules</h3>
              <div className="space-y-4">
                {course.modules.map((module, index) => (
                  <div
                    key={index}
                    className="flex items-center p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mr-4 font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">
                        {module}
                      </span>
                    </div>
                    {course.isEnrolled &&
                      index <
                        course.progress / (100 / course.modules.length) && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              {!course.isEnrolled && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-primary">
                      ₦{course.price.toLocaleString()}
                    </span>
                    {course.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        ₦{course.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">One-time payment</p>
                </div>
              )}

              <Button
                className="w-full mb-4 h-12 hover:bg-accent"
                onClick={handleButtonClick}
                variant={course.progress === 100 ? "outline" : "default"}
              >
                {getActionButtonText()}
              </Button>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{course.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Level:</span>
                  <span className="font-medium">{course.difficulty}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Students:</span>
                  <span className="font-medium">
                    {course.students
                      ? course.students.toLocaleString()
                      : "No students yet"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{course.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
