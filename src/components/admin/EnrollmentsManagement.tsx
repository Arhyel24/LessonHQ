"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Trash2 } from "lucide-react";
import { EnrollmentForm } from "@/components/admin/EnrollmentForm";
import { Skeleton } from "@/components/ui/skeleton";
import Fuse from "fuse.js";

export interface Enrollment {
  id: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  enrolledAt: string;
  progress: number;
  status: "active" | "completed" | "cancelled";
  completedLessons: number;
  totalLessons: number;
}

export interface CourseOption {
  id: string;
  name: string;
}

export const EnrollmentsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);


  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/admin/courses/enrol?page=${page}&limit=${limit}`
        );
        const data = await response.json();

        if (data.success) {
          setEnrollments(data.data.enrollments);
          setCourseOptions(data.data.courses);
          setTotalPages(data.data.pagination.totalPages || 1);
        } else {
          throw new Error("Failed to fetch enrollments");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrollments();
  }, [page, limit]);
  

  // Configure fuzzy search
  const fuse = new Fuse(enrollments, {
    keys: ["studentName", "courseName", "studentEmail"],
    includeScore: true,
    threshold: 0.4,
  });

  const filteredEnrollments = searchTerm
    ? fuse.search(searchTerm).map((result) => result.item)
    : enrollments;

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Enrollments Management
            </h1>
            <p className="text-gray-600">Manage student course enrollments</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-red-500">Error: {error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Enrollments Management
          </h1>
          <p className="text-gray-600">Manage student course enrollments</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Enroll Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Enroll Student in Course</DialogTitle>
            </DialogHeader>
            <EnrollmentForm
              onClose={() => setIsAddDialogOpen(false)}
              courseOptions={courseOptions}
              onSuccess={(newEnrollment: Enrollment) => {
                setEnrollments((prev) => [newEnrollment, ...prev]);
                setIsAddDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search enrollments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-gray-300" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Lessons</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.length > 0 ? (
                    filteredEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">
                              {enrollment.studentName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {enrollment.studentEmail}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{enrollment.courseName}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${enrollment.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {enrollment.progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {enrollment.completedLessons}/
                          {enrollment.totalLessons}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              enrollment.status === "completed"
                                ? "default"
                                : enrollment.status === "cancelled"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {enrollment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {searchTerm
                          ? "No matching enrollments found"
                          : "No enrollments available"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </p>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages))
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
