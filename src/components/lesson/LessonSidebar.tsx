
import { CheckCircle, Lock, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
}

interface LessonSidebarProps {
  lessons: Lesson[];
  currentLessonId: string;
  courseProgress: number;
  completedLessons: number;
  totalLessons: number;
  onLessonClick: (lessonId: string, isLocked: boolean) => void;
}

interface LessonSidebarProps {
  lessons: {
    id: string;
    title: string;
    duration: string;
    isCompleted: boolean;
    isLocked: boolean;
  }[];
  currentLessonId: string;
  courseProgress: number;
  completedLessons: number;
  totalLessons: number;
  onLessonClick: (lessonId: string, isLocked: boolean) => void;
}

export const LessonSidebar = ({
  lessons,
  currentLessonId,
  courseProgress,
  completedLessons,
  totalLessons,
  onLessonClick,
}: LessonSidebarProps) => {

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="font-poppins text-lg">Course Progress</CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {completedLessons} of {totalLessons} lessons
            </span>
            <span className="font-medium text-primary">{courseProgress}%</span>
          </div>
          <Progress value={courseProgress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className={cn(
                "border-b last:border-b-0 transition-colors",
                currentLessonId === lesson.id
                  ? "bg-primary/5"
                  : "hover:bg-gray-50"
              )}
            >
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start p-4 h-auto rounded-none",
                  lesson.isLocked && "cursor-not-allowed opacity-60"
                )}
                onClick={() => onLessonClick(lesson.id, lesson.isLocked)}
                disabled={lesson.isLocked}
              >
                <div className="flex items-start gap-3 w-full">
                  {/* Lesson Number/Status Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {lesson.isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : lesson.isLocked ? (
                      <Lock className="h-5 w-5 text-gray-400" />
                    ) : currentLessonId === lesson.id ? (
                      <Play className="h-5 w-5 text-primary" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {index + 1}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Lesson Info */}
                  <div className="flex-1 text-left">
                    <h4
                      className={cn(
                        "font-medium text-sm leading-snug",
                        currentLessonId === lesson.id
                          ? "text-primary"
                          : "text-gray-900",
                        lesson.isLocked && "text-gray-500"
                      )}
                    >
                      {lesson.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {lesson.duration}
                    </p>
                  </div>
                </div>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
