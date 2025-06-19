"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type Course = {
  id: string;
  title: string;
  slug: string;
  price: number;
  students: number;
  lessons: number;
  status: "Published" | "Draft" | "Archived";
  createdAt: string;
};

interface CoursesManagementProps {
  onNavigateToAddCourse: () => void;
}

export const CoursesManagement = ({
  onNavigateToAddCourse,
}: CoursesManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/courses?page=${page}&search=${searchTerm}`
      );
      const json = await res.json();
      if (json.success) {
        setCourses(json.data.courses);
        setPagination(json.data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch courses", err);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);  

  const handleDelete = async () => {
    if (!selectedCourse) return;

    try {
      const res = await fetch("/api/admin/courses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedCourse.id }),
      });

      const json = await res.json();

      if (json.success) {
        toast({ title: "Course deleted", description: selectedCourse.title });
        fetchCourses();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: json.message || "Failed to delete",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong",
      });
      console.error("Failed to fetch courses", err);
    } finally {
      setConfirmOpen(false);
      setSelectedCourse(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Courses Management
          </h1>
          <p className="text-gray-600">
            Manage your course catalog and content
          </p>
        </div>

        <Button onClick={onNavigateToAddCourse} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin w-6 h-6 text-primary" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Lessons</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-10"
                      >
                        No courses found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">
                              {course.title}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>₦{course.price.toLocaleString()}</TableCell>
                        <TableCell>{course.students}</TableCell>
                        <TableCell>{course.lessons}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              course.status === "Published"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {course.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{course.createdAt}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/course/${course.id}/edit`)
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => {
                                setSelectedCourse(course);
                                setConfirmOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="flex justify-between items-center mt-6">
                <Button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={!pagination.hasPrev || loading}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={!pagination.hasNext || loading}
                  variant="outline"
                >
                  Next
                </Button>
              </div>

              {/* Delete Confirmation Modal */}
              <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Course</DialogTitle>
                  </DialogHeader>

                  {selectedCourse && selectedCourse?.students > 0 ? (
                    <div className="space-y-4">
                      <p>
                        <span className="font-semibold text-red-600">
                          Cannot delete:
                        </span>{" "}
                        This course has{" "}
                        <strong>{selectedCourse.students}</strong> enrolled
                        student
                        {selectedCourse.students > 1 ? "s" : ""}. Please remove
                        students before deletion.
                      </p>
                      <Button
                        variant="secondary"
                        onClick={() => setConfirmOpen(false)}
                      >
                        Close
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p>
                        Are you sure you want to delete{" "}
                        <strong>{selectedCourse?.title}</strong>? This action
                        cannot be undone.
                      </p>
                      <DialogFooter>
                        <Button
                          variant="secondary"
                          onClick={() => setConfirmOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                          Delete
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
