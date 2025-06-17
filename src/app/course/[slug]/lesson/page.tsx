"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Home, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/lesson/VideoPlayer";
import { LessonSidebar } from "@/components/lesson/LessonSidebar";
import { LessonNotes } from "@/components/lesson/LessonNotes";
import { CertificateSection } from "@/components/lesson/CertificateSection";
import { CourseReviewForm } from "@/components/lesson/CourseReviewForm";
import { toast } from "@/hooks/use-toast";
import { LoadingScreen } from "@/components/loading-screen";

const Lesson = () => {
  const router = useRouter();
  const { slug } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [course, setCourse] = useState<any | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMarking, setIsMarking] = useState(false)

  const fetchLesson = async (lessonId?: string) => {
    try {
      const url = lessonId
        ? `/api/course/learning/${slug}?lessonId=${lessonId}`
        : `/api/course/learning/${slug}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unknown error");
        return;
      }

      setCourse(data.course);
      setLessons(data.lessons);
      setCurrentLesson(data.currentLesson);
    } catch (err) {
      console.error("Lesson fetch failed:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [slug]);

  const handleLessonClick = (lessonId: string, isLocked: boolean) => {
    if (isLocked) return;
    fetchLesson(lessonId);
    setIsSidebarOpen(false);
  };

  async function markLessonComplete(lessonId: string) {
    setIsMarking(true)
    
    try {
      const res = await fetch("/api/course/lesson/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId: course.id, lessonId }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.error || "Failed to mark lesson as completed.");
      }
  
      toast({
        title: "Lesson marked completed!",
        description: "You can now proceed to the next lesson.",
        variant: "success",
      });
      fetchLesson()
    } catch (error: any) {
      console.error("markLessonComplete error:", error.message);
      toast({
        title: "Error completing lesson",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsMarking(false)
    }
  }

  if (loading) return <LoadingScreen message="Loading lesson..."/>

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
            onClick={() => router.push("/dashboard")}
            className="bg-primary text-white"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  

  const isLastLesson = currentLesson?.id === lessons[lessons.length - 1]?.id;
  const isCourseComplete = course.progress === 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1 className="font-poppins font-semibold text-lg text-gray-900 truncate">
            {course.title}
          </h1>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => router.refresh()}
              className="flex items-center gap-2 text-gray-600 hover:text-primary"
            >
              <RefreshCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-primary"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <VideoPlayer
              id={currentLesson.id}
              title={currentLesson.title}
              videoUrl={currentLesson.videoUrl}
              duration={currentLesson.duration}
              isCompleted={currentLesson.isCompleted}
              markComplete={markLessonComplete}
              isMarking={isMarking}
            />
            <LessonNotes content={currentLesson.notes} />
            <CourseReviewForm courseTitle={course.title} />
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
              onLessonClick={handleLessonClick}
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
            <div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
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
                  onLessonClick={handleLessonClick}
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
