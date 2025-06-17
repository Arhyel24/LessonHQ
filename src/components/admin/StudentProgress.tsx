import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, User } from "lucide-react";
import { UserSelectionModal } from "@/components/admin/UserSelectionModal";
import debounce from "lodash.debounce";

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const StudentProgress = () => {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentData, setStudentData] = useState<{ courses: any[] } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchUsers = async (search?: string) => {
    setSearchLoading(true);
    try {
      const url = search
        ? `/api/admin/users?simple=true&search=${encodeURIComponent(search)}`
        : `/api/admin/users?simple=true`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setStudents(data.data);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("User fetch failed", err);
      setStudents([]);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedStudent) return;

    const fetchProgress = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/users/progress/${selectedStudent}`);
        const json = await res.json();
        if (json.success) {
          setStudentData(json.data);
        } else {
          setStudentData(null);
        }
      } catch (error) {
        console.error("Failed to fetch student progress:", error);
        setStudentData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
    fetchUsers();
  }, [selectedStudent]);

  useEffect(() => {
    const handler = debounce((value: string) => {
      fetchUsers(value.trim());
    }, 500);

    if (searchTerm.trim()) {
      handler(searchTerm);
    } else {
      fetchUsers();
    }

    return () => {
      handler.cancel();
    };
  }, [searchTerm]);

  const handleSelectUser = (student: Student) => {
    setSelectedStudent(student.id);
    setSelectedStudentName(student.name);
    setIsModalOpen(false);
    setSearchTerm("");
  };

  const toggleLessonCompletion = (courseId: string, lessonId: string) => {
    console.log(`Toggle lesson ${lessonId} in course ${courseId}`);
    
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Progress</h1>
        <p className="text-gray-600">
          View and manage individual student progress
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Student
              </label>
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(true)}
                className="w-full justify-start h-auto p-3"
              >
                <User className="mr-2 h-4 w-4" />
                {selectedStudentName || "Select a student to view progress"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {loading && (
        <p className="text-gray-500 text-center">Loading progress...</p>
      )}

      {studentData && studentData?.courses?.length > 0 && (
        <div className="space-y-6">
          {studentData.courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {course.completedLessons} of {course.totalLessons} lessons
                      completed
                    </p>
                  </div>
                  <div className="text-left lg:text-right">
                    <div className="text-2xl font-bold text-primary">
                      {course.progress}%
                    </div>
                    <Badge
                      variant={
                        course.certificateIssued ? "default" : "secondary"
                      }
                    >
                      {course.certificateIssued
                        ? "Certificate Issued"
                        : "In Progress"}
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">
                    Lessons Progress
                  </h4>
                  <div className="grid gap-2">
                    {course.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {lesson.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          )}
                          <span
                            className={`truncate ${
                              lesson.completed
                                ? "text-gray-900"
                                : "text-gray-600"
                            }`}
                          >
                            {lesson.title}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleLessonCompletion(course.id, lesson.id)
                          }
                          className="flex-shrink-0 ml-2"
                        >
                          {lesson.completed
                            ? "Mark Incomplete"
                            : "Mark Complete"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedStudent &&
        !loading &&
        (!studentData || studentData.courses.length === 0) && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">
                No course enrollments found for this student.
              </p>
            </CardContent>
          </Card>
        )}

      <UserSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        students={students}
        searchTerm={searchTerm}
        setSearchTerm={(e: string) => setSearchTerm(e)}
        loading={searchLoading}
        onSelectUser={handleSelectUser}
      />
    </div>
  );
};
