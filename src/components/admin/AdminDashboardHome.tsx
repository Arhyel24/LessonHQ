"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, DollarSign, UserCheck } from "lucide-react";
import { LoadingScreen } from "../loading-screen";
import { Button } from "@/components/ui/button";

export const AdminDashboardHome = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activityPage, setActivityPage] = useState(1);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/dashboard?page=${activityPage}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [activityPage]);

  if (loading || !data) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  const { pagination } = data;

  const metrics = [
    {
      title: "Total Users",
      value: data.totalUser,
      icon: Users,
      change: data.metricsChange?.totalUser || "–",
      color: "text-blue-600",
    },
    {
      title: "Active Students",
      value: data.activeStudents,
      icon: UserCheck,
      change: data.metricsChange?.activeStudents || "–",
      color: "text-green-600",
    },
    {
      title: "Total Courses",
      value: data.totalCourses,
      icon: BookOpen,
      change: data.metricsChange?.totalCourses || "–",
      color: "text-purple-600",
    },
    {
      title: "Total Revenue",
      value: `₦${data.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: data.metricsChange?.totalRevenue || "–",
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">
          Welcome back! Here&apos;s what&apos;s happening on your platform.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {metric.value}
              </div>
              <p
                className={`text-xs mt-1 ${
                  metric.change.includes("-")
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {metric.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentActivity.length > 0 ? (
              data.recentActivity.map((activity: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "registration"
                        ? "bg-blue-500"
                        : activity.type === "purchase"
                        ? "bg-green-500"
                        : "bg-purple-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      <span className="font-semibold">{activity.user}</span>{" "}
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-600">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No activity found.
              </p>
            )}
          </div>

          {/* Pagination controls */}
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => setActivityPage((prev) => prev - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setActivityPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
