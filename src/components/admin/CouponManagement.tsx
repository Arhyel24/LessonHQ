"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Calendar,
  Percent,
  Tag,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ICoupon } from "@/lib/models/Coupon";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "../ui/checkbox";
import { LoadingScreen, useLoading } from "../loading-screen";
import { Badge } from "../ui/badge";

const PAGE_LIMIT = 10;

interface Course {
  id: string;
  name: string;
}

export const CouponManagement = () => {
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    pages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    message: "",
    usageLimit: "",
    singleUse: false,
    applicableCourses: [] as string[],
    minimumAmount: "",
    expiresAt: "",
  });
  const [metrics, setMetrics] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    totalUsage: 0,
    expiringSoonCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const { isLoading, showLoading, hideLoading } = useLoading();

  // Utility: check if all courses are selected
const allSelected = courses.length > 0 && courses.every((course) =>
  formData.applicableCourses.includes(course.id)
);

// Handler for toggling all
const toggleSelectAllCourses = () => {
  if (allSelected) {
    setFormData({ ...formData, applicableCourses: [] });
  } else {
    setFormData({
      ...formData,
      applicableCourses: courses.map((course) => course.id),
    });
  }
};

  const fetchCoupons = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/coupons?page=${page}&limit=${PAGE_LIMIT}`
      );
      if (!res.ok) throw new Error("Failed to fetch coupons");
      const data = await res.json();
      setCoupons(data.data.coupons);
      setCourses(data.data.courses);
      setPagination(data.data.pagination);
      setMetrics(data.data.metrics)
    } catch (error) {
      console.error("Error fetching coupons:", error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons(pagination.page);
  }, [pagination.page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCoupon = async () => {
    if (!formData.code || !formData.value) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in code and value fields.",
        variant: "destructive",
      });
      return;
    }

    const newCoupon = {
      code: formData.code.toUpperCase(),
      type: formData.type as "percentage" | "fixed",
      value: Number(formData.value),
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
      singleUse: formData.singleUse,
      applicableCourses:
        formData.applicableCourses?.length > 0
          ? formData.applicableCourses
          : undefined,
      minimumAmount: formData.minimumAmount
        ? Number(formData.minimumAmount)
        : undefined,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
      message: formData.message || "",
    };

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCoupon),
      });

      if (!res.ok) {
        throw new Error("Failed to create coupon");
      }

      const data = await res.json();

      toast({
        title: "Coupon Created",
        description: `Coupon ${data.data.code} has been created successfully.`,
        variant: "success",
      });

      fetchCoupons(pagination.page);

      setFormData({
        code: "",
        type: "percentage",
        value: "",
        message: "",
        usageLimit: "",
        singleUse: false,
        applicableCourses: [],
        minimumAmount: "",
        expiresAt: "",
      });
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast({
        title: "Error",
        description: "Failed to create coupon. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
      setIsCreateDialogOpen(false);
    }
  };

  const handleCopyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: `Coupon code ${code} copied to clipboard.`,
    });
  };

  const toggleCouponStatus = async (id: string) => {
    if (isLoading) return // Do nothing
    showLoading()
    try {
      const res = await fetch(`/api/admin/coupons/status/${id}`, {
        method: "PATCH",
      });

      if (!res.ok) {
        throw new Error("Failed to update status!");
      }

      const data = await res.json();

      fetchCoupons(pagination.page);

      toast({
        title: "Coupon Status Updated",
        description: `Coupon status has been ${
          data.coupon.isValid ? "activated" : "deactivated"
        }.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while toggling the status.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      hideLoading()
    }
  };

  const deleteCoupon = (id: string) => {
    setCoupons(coupons.filter((coupon) => coupon.id !== id));
    toast({
      title: "Coupon Deleted",
      description: "The coupon has been deleted successfully.",
    });
  };

  const handleCourseSelection = (courseId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        applicableCourses: [...formData.applicableCourses, courseId],
      });
    } else {
      setFormData({
        ...formData,
        applicableCourses: formData.applicableCourses.filter(
          (id) => id !== courseId
        ),
      });
    }
  };

  if (loading) return <LoadingScreen message="Loading coupons...." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Coupon Management
          </h1>
          <p className="text-gray-600">
            Create and manage discount coupons for your courses
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 cursor-pointer">
              <Plus className="h-4 w-4" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coupon-code">Coupon Code *</Label>
                  <Input
                    id="coupon-code"
                    placeholder="e.g., SAVE20"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coupon-type">Discount Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (₦)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coupon-value">
                    Value * {formData.type === "percentage" ? "(%)" : "(₦)"}
                  </Label>
                  <Input
                    id="coupon-value"
                    type="number"
                    placeholder={formData.type === "percentage" ? "20" : "5000"}
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimum-amount">
                    Minimum Order Amount (₦)
                  </Label>
                  <Input
                    id="minimum-amount"
                    type="number"
                    placeholder="0"
                    value={formData.minimumAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minimumAmount: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coupon-message">Description/Message</Label>
                <Textarea
                  id="coupon-message"
                  placeholder="Describe what this coupon is for..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                />
              </div>

              {/* Usage Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usage-limit">Usage Limit</Label>
                  <Input
                    id="usage-limit"
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires-at">Expiry Date</Label>
                  <Input
                    id="expires-at"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData({ ...formData, expiresAt: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Toggle Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="single-use">Single Use Only</Label>
                    <p className="text-sm text-gray-500">
                      Each user can only use this coupon once
                    </p>
                  </div>
                  <Switch
                    id="single-use"
                    checked={formData.singleUse}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, singleUse: checked })
                    }
                  />
                </div>
              </div>

              {/* Course Selection */}
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  Applicable Courses
                </Label>
                <p className="text-sm text-gray-500">
                  Select courses this coupon applies to (leave empty for all
                  courses)
                </p>

                {courses && courses.length > 0 ? (
                  <>
                    {/* Select All Toggle */}
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id="select-all-courses"
                        checked={allSelected}
                        onCheckedChange={toggleSelectAllCourses}
                        className="border border-red-500 data-[state=checked]:bg-primary data-[state=checked]:text-white"
                      />
                      <Label htmlFor="select-all-courses" className="text-sm">
                        Select All Courses
                      </Label>
                    </div>

                    {/* Courses List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border rounded-md p-4 max-h-40 overflow-y-auto">
                      {courses.map((course) => {
                        const courseId = course.id;
                        const isChecked =
                          formData.applicableCourses.includes(courseId);
                        return (
                          <div
                            key={courseId}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`course-${courseId}`}
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                handleCourseSelection(
                                  courseId,
                                  checked as boolean
                                )
                              }
                              className="border border-red-500 data-[state=checked]:bg-primary data-[state=checked]:text-white"
                            />
                            <Label
                              htmlFor={`course-${courseId}`}
                              className="text-sm"
                            >
                              {course.name}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No courses found. Please add courses first.
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateCoupon} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Coupon"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCoupons}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Coupons
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeCoupons}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsage}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.expiringSoonCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search coupons..."
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
              <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
            </div>
          ) : filteredCoupons.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No coupons found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Valid</TableHead>
                  <TableHead>Used / Limit</TableHead>
                  <TableHead>Single Use</TableHead>
                  <TableHead>Min. Amount</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.map((coupon) => (
                  <TableRow key={coupon.code}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {coupon.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCouponCode(coupon.code)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      {coupon.singleUse && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Single Use
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">{coupon.type}</TableCell>
                    <TableCell>
                      {coupon.type === "percentage"
                        ? `${coupon.value}%`
                        : `₦${coupon.value.toLocaleString()}`}
                    </TableCell>
                    <TableCell>
                      {coupon.isValid ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-600">No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {coupon.usedCount}
                      {coupon.usageLimit !== undefined &&
                      coupon.usageLimit !== null
                        ? ` / ${coupon.usageLimit}`
                        : " / ∞"}
                    </TableCell>
                    <TableCell>{coupon.singleUse ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      {coupon.minimumAmount
                        ? `₦${coupon.minimumAmount.toLocaleString()}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {coupon.expiresAt
                        ? format(new Date(coupon.expiresAt), "PPP")
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={coupon.isValid ? "default" : "secondary"}>
                        {coupon.isValid ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCouponStatus(coupon.id)}
                        >
                          {coupon.isValid ? "Deactivate" : "Activate"}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCoupon(coupon.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination controls */}
          {pagination.pages > 1 && (
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                disabled={!pagination.hasPrev}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                disabled={!pagination.hasNext}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
