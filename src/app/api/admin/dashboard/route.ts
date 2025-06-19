import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/utils/authOptions";
import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";
import Course from "@/lib/models/Course";
import Purchase from "@/lib/models/Purchase";
import Activity from "@/lib/models/Activity";

/**
 * GET /api/admin/dashboard
 * Get dashboard analytics and recent activity with pagination support
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const adminUser = await User.findOne({ email: session.user.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const now = new Date();
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);

    // Current stats
    const [
      totalUsers,
      totalCourses,
      totalRevenue,
      activeStudents,
      recentActivities,
      totalActivitiesCount,
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments({ status: "published" }),
      Purchase.aggregate([
        { $match: { status: "completed", createdAt: { $lte: now } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Purchase.distinct("user", { status: "completed" }).then(
        (users) => users.length
      ),
      Activity.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name")
        .lean(),
      Activity.countDocuments(),
    ]);

    // Last month stats for comparison
    const [
      lastMonthUsers,
      lastMonthCourses,
      lastMonthRevenue,
      lastMonthActiveStudents,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: oneMonthAgo, $lte: now } }),
      Course.countDocuments({
        status: "published",
        createdAt: { $gte: oneMonthAgo, $lte: now },
      }),
      Purchase.aggregate([
        {
          $match: {
            status: "completed",
            createdAt: { $gte: oneMonthAgo, $lte: now },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Purchase.distinct("user", {
        status: "completed",
        createdAt: { $gte: oneMonthAgo, $lte: now },
      }).then((users) => users.length),
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    const lastRevenue =
      lastMonthRevenue.length > 0 ? lastMonthRevenue[0].total : 0;

    const transformedActivities = recentActivities.map((activity) => {
      const timeAgo = getTimeAgo(activity.createdAt);
      let action = "";
      let type = "";

      switch (activity.type) {
        case "course_purchased":
          type = "purchase";
          action = `purchased ${activity.data?.courseTitle || "a course"}`;
          break;
        case "course_completed":
          type = "completion";
          action = `completed ${activity.data?.courseTitle || "a course"}`;
          break;
        case "profile_updated":
          type = "registration";
          action = "registered";
          break;
        default:
          type = "activity";
          action = activity.message;
      }

      return {
        type,
        user: activity.user?.name || "Unknown User",
        action,
        time: timeAgo,
      };
    });

    // Growth helper
    const getChangePercent = (current: number, previous: number) => {
      if (previous === 0) return "+100%";
      const change = ((current - previous) / previous) * 100;
      const sign = change >= 0 ? "+" : "";
      return `${sign}${change.toFixed(1)}%`;
    };

    const dashboardData = {
      totalUser: totalUsers,
      activeStudents,
      totalCourses,
      totalRevenue: revenue,
      metricsChange: {
        totalUser: getChangePercent(totalUsers, totalUsers - lastMonthUsers),
        activeStudents: getChangePercent(
          activeStudents,
          activeStudents - lastMonthActiveStudents
        ),
        totalCourses: getChangePercent(
          totalCourses,
          totalCourses - lastMonthCourses
        ),
        totalRevenue: getChangePercent(revenue, revenue - lastRevenue),
      },
      recentActivity: transformedActivities,
      pagination: {
        page,
        limit,
        totalActivities: totalActivitiesCount,
        totalPages: Math.ceil(totalActivitiesCount / limit),
      },
    };

    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else if (diffInDays === 1) {
    return "1 day ago";
  } else {
    return `${diffInDays} days ago`;
  }
}
