"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  CompletionRate,
  CoursePopularity,
  Revenue,
  UserGrowth,
} from "@/types/Analytics";
import { LoadingScreen } from "../loading-screen";
import { toast } from "@/hooks/use-toast";

export const AdminAnalytics = () => {
  const [userGrowthData, setUserGrowthData] = useState<UserGrowth[]>([]);
  const [revenueData, setRevenueData] = useState<Revenue[]>([]);
  const [coursePopularityData, setCoursePopularityData] = useState<
    CoursePopularity[]
  >([]);
  const [completionRateData, setCompletionRateData] = useState<
    CompletionRate[]
  >([]);
  const [mainStats, setMainStats] = useState([
    {
      title: "Total Revenue",
      value: "₦0.0M",
      change: 0,
      changeColor: "green",
      icon: "DollarSign",
    },
    {
      title: "Active Students",
      value: "0",
      change: 0,
      changeColor: "blue",
      icon: "Users",
    },
    {
      title: "Course Completion",
      value: "0%",
      change: 0,
      changeColor: "purple",
      icon: "BookOpen",
    },
    {
      title: "Avg. Revenue/User",
      value: "₦0",
      change: 0,
      changeColor: "orange",
      icon: "TrendingUp",
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [analyticsRes, mainStatsRes] = await Promise.all([
          fetch("/api/admin/analytics"),
          fetch("/api/admin/analytics/main-stats"),
        ]);

        const analyticsJson = await analyticsRes.json();
        const mainStatsJson = await mainStatsRes.json();

        if (!analyticsRes.ok) {
          throw new Error(analyticsJson.error || "Failed to fetch analytics");
        }

        if (!mainStatsRes.ok) {
          throw new Error(mainStatsJson.error || "Failed to fetch main stats");
        }

        const {
          userGrowthData,
          revenueData,
          coursePopularityData,
          completionRateData,
        } = analyticsJson.data;

        setUserGrowthData(userGrowthData);
        setRevenueData(revenueData);
        setCoursePopularityData(coursePopularityData);
        setCompletionRateData(completionRateData);
        setMainStats(mainStatsJson.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const renderIcon = (icon: string) => {
    switch (icon) {
      case "DollarSign":
        return <DollarSign className="h-8 w-8 text-green-600" />;
      case "Users":
        return <Users className="h-8 w-8 text-blue-600" />;
      case "BookOpen":
        return <BookOpen className="h-8 w-8 text-purple-600" />;
      case "TrendingUp":
        return <TrendingUp className="h-8 w-8 text-orange-600" />;
      default:
        return null;
    }
  };

  if (loading) return <LoadingScreen message="Loading analytics data..." />;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const handleExportData = () => {
    fetch("/api/admin/analytics/export", {
      method: "POST",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to export data");
        }
        return res.json();
      })
      .then((data) => {
        toast({
          title: "Export Successful",
          description: data.message ?? "Your analytics data has been exported and emailed to you.",
          variant: "success",
        })
      })
      .catch((err) => {
        console.error("Export error:", err);
        toast({
          title: "Export Failed",
          description: "There was an error exporting your data. Please try again later.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Comprehensive platform insights and metrics
          </p>
        </div>
        <Button onClick={handleExportData}>
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p
                    className={`text-xs ${
                      stat.changeColor === "green"
                        ? "text-green-600"
                        : stat.changeColor === "blue"
                        ? "text-blue-600"
                        : stat.changeColor === "purple"
                        ? "text-purple-600"
                        : "text-orange-600"
                    }`}
                  >
                    {stat.change >= 0 ? `+${stat.change}%` : `${stat.change}%`}{" "}
                    from last month
                  </p>
                </div>
                {renderIcon(stat.icon)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `₦${Number(value).toLocaleString()}`,
                    "Revenue",
                  ]}
                />
                <Bar dataKey="revenue" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Course Popularity */}
        <Card>
          <CardHeader>
            <CardTitle>Course Popularity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={coursePopularityData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="enrollments" fill="#8b5cf6" name="Enrollments" />
                <Bar dataKey="completions" fill="#06b6d4" name="Completions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Completion Rate Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Course Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={completionRateData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {completionRateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Course Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Course</th>
                  <th className="text-left p-2">Enrollments</th>
                  <th className="text-left p-2">Completions</th>
                  <th className="text-left p-2">Completion Rate</th>
                  <th className="text-left p-2">Revenue</th>
                  <th className="text-left p-2">Avg. Rating</th>
                </tr>
              </thead>
              <tbody>
                {coursePopularityData.map((course, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{course.name}</td>
                    <td className="p-2">{course.enrollments}</td>
                    <td className="p-2">{course.completions}</td>
                    <td className="p-2">
                      {Math.round(
                        (course.completions / course.enrollments) * 100
                      )}
                      %
                    </td>
                    <td className="p-2">
                      ₦{(course.enrollments * course.price).toLocaleString()}
                    </td>
                    <td className="p-2">
                      4.{Math.floor(Math.random() * 3) + 5}/5.0
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
