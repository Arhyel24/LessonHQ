"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  title: string;
  slug: string;
  progress: number;
  lastAccessedAt: string;
  totalLessons: number;
  completedLessons: number;
}

export const CourseProgressSection = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/purchases/my-courses");
        const json = await res.json();
        if (json.success) {
          setCourses(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-green-500";
    if (progress >= 50) return "bg-primary";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-gray-400";
  };

  const handleCourseButton = (slug: string) => {
    router.push(`/course/${slug}/lesson`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-poppins font-semibold text-xl text-gray-900">
          Your Courses
        </h2>
        <Button asChild variant="outline" size="sm">
          <Link href="/courses">View All</Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading your progress...</p>
      ) : courses.length === 0 ? (
        <div className="text-center py-10">
          <BookOpen className="w-10 h-10 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-3 text-sm font-nunito">
            You haven&apos;t started any course yet.
          </p>
          <Button asChild className="bg-primary text-white">
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="border border-gray-100 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-inter font-medium text-gray-900 mb-1">
                    {course.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {course.completedLessons}/{course.totalLessons} lessons
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {course.lastAccessedAt}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-inter font-semibold text-sm text-gray-900">
                    {course.progress}%
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <Progress
                  value={course.progress}
                  className="h-2"
                  progressColor={getProgressColor(course.progress)}
                />
              </div>

              <Button
                onClick={() => handleCourseButton(course.slug)}
                className={`w-full text-white font-inter ${getProgressColor(
                  course.progress
                )}`}
                size="sm"
              >
                Continue Learning
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
