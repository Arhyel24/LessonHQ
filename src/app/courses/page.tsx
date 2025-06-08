"use client"

import { useEffect, useState } from "react";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { CTAFooter } from "@/components/courses/CTAFooter";
import { FilterType, ICourse } from "@/lib/models/Course";

export interface ICourseExtended extends ICourse {
  progress: number;
  isEnrolled: boolean;
  isCompleted: boolean;
  badge?: string;
  duration: string;
  modules: string[];
}

const Courses = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [courses, setCourses] = useState<ICourseExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses");
        if (!res.ok) throw new Error("Failed to fetch courses");
        const json = await res.json();

        if (!json.success) throw new Error(json.error || "Failed to fetch courses");

        setCourses(json.data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  if (loading) {
    return <p className="p-6 text-center text-gray-500">Loading courses...</p>;
  }

  // Filter courses based on selection
  const filteredCourses = courses.filter((course) => {
    switch (selectedFilter) {
      case "in-progress":
        return course.isEnrolled && !course.isCompleted;
      case "completed":
        return course.isCompleted;
      case "not-started":
        return !course.isEnrolled;
      default:
        return true;
    }
  });

  // Count enrolled courses for stats
  const enrolledCount = courses.filter((course) => course.isEnrolled).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title Section */}
        <div className="text-center mb-8">
          <h1 className="font-poppins font-bold text-3xl md:text-4xl text-gray-900">
            Available Courses
          </h1>
          <p className="font-nunito text-lg text-gray-600 mt-3">
            Pick a skill. Learn fast. Start earning.
          </p>

          {/* Stats banner */}
          <div className="inline-flex items-center bg-primary/10 rounded-full px-4 py-2 mt-4">
            <span className="font-medium text-primary mr-2">1000+</span>
            <span className="text-gray-700">Students Trained</span>
            {enrolledCount > 0 && (
              <>
                <span className="mx-2 text-gray-400">•</span>
                <span className="font-medium text-primary mr-2">
                  {enrolledCount}
                </span>
                <span className="text-gray-700">Courses In Your Library</span>
              </>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <CourseFilters
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />

        {/* Empty state if no courses match filter */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="font-poppins font-medium text-xl text-gray-900 mb-2">
              No courses found
            </h3>
            <p className="font-nunito text-gray-600 max-w-md mx-auto">
              {selectedFilter === "not-started"
                ? "You've already enrolled in all available courses. Great job!"
                : selectedFilter === "in-progress"
                ? "You don't have any courses in progress yet. Start learning now!"
                : selectedFilter === "completed"
                ? "You haven't completed any courses yet. Keep learning!"
                : "No courses available at this time. Check back later!"}
            </p>
          </div>
        )}

        {/* Courses Grid */}
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>

        {/* CTA Footer */}
        <CTAFooter />
      </div>
    </div>
  );
};

export default Courses;
