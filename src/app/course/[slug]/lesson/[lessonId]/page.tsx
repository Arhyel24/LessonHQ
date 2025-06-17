"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/lesson/VideoPlayer";
import { LessonSidebar } from "@/components/lesson/LessonSidebar";
import { LessonNotes } from "@/components/lesson/LessonNotes";
import { CertificateSection } from "@/components/lesson/CertificateSection";
import { CourseReviewForm } from "@/components/lesson/CourseReviewForm";
import axios from "axios";

const Lesson = () => {
  const router = useRouter();
  const { slug, lessonId } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const res = await axios.get(`/api/course/learning/${slug}/${lessonId}`);
        setData(res.data);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setError("You have not purchased this course.");
        } else if (err.response?.status === 404) {
          setError("Course not found.");
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading course...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Oops!</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button
          onClick={() => router.push("/dashboard")}
          className="bg-primary text-white"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const { course, currentLesson, lessons } = data;

  const isLastLesson = currentLesson?.id === lessons[lessons.length - 1]?.id;
  const isCourseComplete = course.progress === 100;

  // Optional: Replace this if you have actual review data
  const existingReview = {
    rating: 4,
    comment: "Great course so far! The content is very well structured.",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1 className="font-poppins font-semibold text-lg text-gray-900 truncate">
            {course.title}
          </h1>
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-primary"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Button>
        </div>
      </header>

      <div className="container px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <VideoPlayer
              title={currentLesson.title}
              videoUrl={currentLesson.videoUrl}
              duration={currentLesson.duration}
              isCompleted={currentLesson.isCompleted}
            />
            <LessonNotes content={currentLesson.notes} />
            <CourseReviewForm
              courseTitle={course.title}
              existingReview={existingReview}
            />
            {isLastLesson && (
              <CertificateSection
                isComplete={isCourseComplete}
                courseName={course.title}
              />
            )}
          </div>

          <div className="hidden lg:block">
            <LessonSidebar
              lessons={lessons}
              currentLessonId={currentLesson.id}
              courseProgress={course.progress}
              completedLessons={course.completedLessons}
              totalLessons={course.totalLessons}
            />
          </div>
        </div>

        <div className="lg:hidden fixed bottom-4 right-4">
          <Button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-full h-12 w-12 shadow-lg"
          >
            <span className="sr-only">View lessons</span>📚
          </Button>
        </div>

        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl max-h-[80vh] overflow-hidden">
              <div className="p-2 border-b flex items-center justify-between">
                <h3 className="font-poppins font-semibold">Course Lessons</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="overflow-y-auto max-h-[60vh]">
                <LessonSidebar
                  lessons={lessons}
                  currentLessonId={currentLesson.id}
                  courseProgress={course.progress}
                  completedLessons={course.completedLessons}
                  totalLessons={course.totalLessons}
                  onLessonClick={() => setIsSidebarOpen(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lesson;
