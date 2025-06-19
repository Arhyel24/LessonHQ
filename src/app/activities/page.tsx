"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Calendar,
  BookOpen,
  CreditCard,
  Users,
  HeadphonesIcon,
  Settings,
  Shield,
  Bell,
  Download,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { IActivity } from "@/lib/models/Activity";
import { toast } from "@/hooks/use-toast";

const UserActivities = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const [activities, setActivities] = useState<IActivity[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "20");
    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (selectedPriority !== "all") params.set("priority", selectedPriority);
    if (activeTab === "unread") params.set("read", "false");
    if (activeTab === "read") params.set("read", "true");

    const res = await fetch(`/api/activity?${params}`);
    const json = await res.json();

    if (json.success) {
      setActivities(json.data.activities);
      setUnreadCount(json.data.unreadCount);
      setTotalPages(json.data.pagination.pages);
    }

    setLoading(false);
  }, [searchTerm, selectedCategory, selectedPriority, activeTab, page]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getActivityIcon = (type: IActivity["type"]) => {
    switch (type) {
      case "course_purchased":
      case "course_completed":
      case "course_added":
        return BookOpen;
      case "lesson_completed":
        return CheckCircle;
      case "certificate_issued":
        return Download;
      case "referral_earned":
        return Users;
      case "payment_received":
      case "payout_requested":
      case "payout_completed":
        return CreditCard;
      case "support_ticket_created":
      case "support_ticket_replied":
        return HeadphonesIcon;
      case "system_announcement":
        return Bell;
      case "profile_updated":
        return Settings;
      case "password_changed":
      case "login_success":
        return Shield;
      case "login_failed":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getPriorityColor = (priority: IActivity["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "low":
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: IActivity["category"]) => {
    switch (category) {
      case "course":
        return "bg-green-100 text-green-800";
      case "payment":
        return "bg-blue-100 text-blue-800";
      case "referral":
        return "bg-purple-100 text-purple-800";
      case "support":
        return "bg-yellow-100 text-yellow-800";
      case "system":
        return "bg-indigo-100 text-indigo-800";
      case "security":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRelativeTime = (date: Date | string) => {
    const dt = new Date(date);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - dt.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return format(dt, "MMM d, yyyy");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Activity Feed
            </h1>
            <p className="text-gray-600">
              Track all your account activities and notifications
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const res = await fetch("/api/activity/mark-all-read", {
                    method: "POST",
                  });
                  const json = await res.json();

                  if (!res.ok || !json.success) {
                    throw new Error(
                      json.message || "Failed to mark all as read"
                    );
                  }

                  toast({
                    title: "Marked as Read",
                    description:
                      "All activities have been successfully marked as read.",
                    variant: "success",
                  });

                  fetchActivities(); // Refresh data
                } catch (err) {
                  toast({
                    title: "Action Failed",
                    description:
                      "Could not mark activities as read. Please try again.",
                    variant: "destructive",
                  });
                  console.error("Error marking all as read:", err);
                }
              }}
            >
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="overflow-visible">
            <div className="flex flex-col gap-4 md:flex-row md:items-center relative z-10">
              {/* Search */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => {
                    setPage(1);
                    setSearchTerm(e.target.value);
                  }}
                  className="pl-10"
                />
              </div>

              {/* Category */}
              <Select
                value={selectedCategory}
                onValueChange={(v) => {
                  setPage(1);
                  setSelectedCategory(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  side="bottom"
                  className="z-[9999]"
                >
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority */}
              <div className="w-full md:w-64 z-[60]">
                <Select
                  value={selectedPriority}
                  onValueChange={(v) => {
                    setPage(1);
                    setSelectedPriority(v);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[60]">
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v);
            setPage(1);
          }}
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all">All Activities</TabsTrigger>
            <TabsTrigger value="unread" className="relative">
              Unread
              {unreadCount > 0 && (
                <Badge className="ml-2 px-1 py-0 text-xs h-5 w-5 rounded-full">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : activities.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No activities found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your filters or search terms.
                  </p>
                </CardContent>
              </Card>
            ) : (
              activities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <Card
                    key={activity.id}
                    className={`transition-all hover:shadow-md ${
                      !activity.read
                        ? "border-l-4 border-l-blue-500 bg-blue-50/50"
                        : ""
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-2 rounded-full ${getCategoryColor(
                            activity.category
                          )}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">
                                  {activity.title}
                                </h3>
                                {!activity.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                              <p className="text-gray-600 mb-2">
                                {activity.message}
                              </p>

                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={getPriorityColor(
                                    activity.priority
                                  )}
                                >
                                  {activity.priority}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className={getCategoryColor(
                                    activity.category
                                  )}
                                >
                                  {activity.category}
                                </Badge>
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {getRelativeTime(activity.createdAt)}
                                </span>
                              </div>
                            </div>

                            {activity.actionUrl && (
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-gray-700 text-sm self-center">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserActivities;
