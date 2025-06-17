"use client";

import { useState, useEffect, useRef } from "react";
import debounce from "lodash/debounce";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CourseOption } from "./EnrollmentsManagement";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { DebouncedFunc } from "lodash";

interface Student {
  id: string;
  name: string;
  email: string;
}

interface EnrollmentFormProps {
  onClose: () => void;
  onSuccess: (newEnrollment: any) => void;
  courseOptions: CourseOption[];
}

export const EnrollmentForm = ({
  onClose,
  courseOptions,
  onSuccess,
}: EnrollmentFormProps) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Ref to hold debounced function
  const debouncedSearchRef = useRef<DebouncedFunc<(search: string) => void>>(
    debounce(() => {}, 300) // placeholder to satisfy initial value
  );

  useEffect(() => {
    debouncedSearchRef.current = debounce(async (search: string) => {
      if (search.trim() === "") {
        setStudents([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/admin/users?simple=true&search=${encodeURIComponent(search)}`
        );
        const data = await response.json();
        if (data.success) {
          setStudents(data.data);
        }
      } catch (error) {
        console.error("Error searching students:", error);
        toast({
          title: "Error",
          description: "Failed to search students",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      debouncedSearchRef.current.cancel();
    };
  }, [toast]);
   // only include actual dependencies

  useEffect(() => {
    debouncedSearchRef.current?.(searchTerm);
  }, [searchTerm]);

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent || selectedCourses.length === 0) return;

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/admin/courses/enrol", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          courseIds: selectedCourses,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to enroll student");
      }

      onSuccess(data.data);
      toast({
        title: "Enrollment Successful",
        description: "Student has been enrolled in selected courses",
        variant: "success",
      });
      onClose();
    } catch (error) {
      console.error("Error enrolling student:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to enroll student",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="student">Select Student</Label>
        <div className="relative mt-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading && (
          <div className="mt-2 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {!isLoading && searchTerm && (
          <div className="mt-2 border rounded-md max-h-60 overflow-auto">
            {students.length > 0 ? (
              students.map((student) => (
                <div
                  key={student.id}
                  className={`p-3 hover:bg-gray-50 cursor-pointer ${
                    selectedStudent?.id === student.id ? "bg-gray-100" : ""
                  }`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.email}</p>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-gray-500">
                No students found
              </div>
            )}
          </div>
        )}

        {selectedStudent && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md">
            <p className="font-medium">Selected Student:</p>
            <p>
              {selectedStudent.name} ({selectedStudent.email})
            </p>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="p-0 h-auto"
              onClick={() => {
                setSelectedStudent(null);
                setSearchTerm("");
              }}
            >
              Clear selection
            </Button>
          </div>
        )}
      </div>

      <div>
        <Label>Select Courses</Label>
        <div className="space-y-2 mt-2">
          {courseOptions.length > 0 ? (
            courseOptions.map((course) => (
              <div key={course.id} className="flex items-center space-x-2">
                <Checkbox
                  id={course.id}
                  checked={selectedCourses.includes(course.id)}
                  onCheckedChange={() => handleCourseToggle(course.id)}
                />
                <Label htmlFor={course.id} className="text-sm">
                  {course.name}
                </Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No courses available</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            !selectedStudent || selectedCourses.length === 0 || isSubmitting
          }
        >
          {isSubmitting ? "Enrolling..." : "Enroll Student"}
        </Button>
      </div>
    </form>
  );
};
