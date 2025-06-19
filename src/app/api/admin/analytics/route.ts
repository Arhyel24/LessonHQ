import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/utils/authOptions";
import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";
import Purchase from "@/lib/models/Purchase";
import Progress from "@/lib/models/Progress";

/**
 * GET /api/admin/analytics
 * Get comprehensive analytics data (admin only)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowthData = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          users: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const revenueData = await Purchase.aggregate([
      {
        $match: {
          status: "completed",
          paidAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$paidAt" },
            month: { $month: "$paidAt" },
          },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const coursePopularityData = await Purchase.aggregate([
      { $match: { status: "completed" } },
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "courseInfo",
        },
      },
      { $unwind: "$courseInfo" },
      {
        $group: {
          _id: "$course",
          name: { $first: "$courseInfo.title" },
          price: { $first: "$courseInfo.price" },
          enrollments: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "progresses",
          let: { courseId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$course", "$$courseId"] },
                    { $eq: ["$percentage", 100] },
                  ],
                },
              },
            },
          ],
          as: "completions",
        },
      },
      {
        $addFields: {
          completions: { $size: "$completions" },
        },
      },
      { $sort: { enrollments: -1 } },
      { $limit: 5 },
    ]);

    const totalEnrollments = await Purchase.countDocuments({
      status: "completed",
    });
    const completedCourses = await Progress.countDocuments({ percentage: 100 });
    const inProgressCourses = await Progress.countDocuments({
      percentage: { $gt: 0, $lt: 100 },
    });
    const notStartedCourses =
      totalEnrollments - completedCourses - inProgressCourses;

    const completionRateData = [
      {
        name: "Completed",
        value:
          totalEnrollments > 0
            ? Math.round((completedCourses / totalEnrollments) * 100)
            : 0,
        color: "#22c55e",
      },
      {
        name: "In Progress",
        value:
          totalEnrollments > 0
            ? Math.round((inProgressCourses / totalEnrollments) * 100)
            : 0,
        color: "#f59e0b",
      },
      {
        name: "Not Started",
        value:
          totalEnrollments > 0
            ? Math.round((notStartedCourses / totalEnrollments) * 100)
            : 0,
        color: "#ef4444",
      },
    ];

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formatMonthlyData = (data: any[], valueKey: "users" | "revenue") => {
      const result: { month: string; [key: string]: number | string }[] = [];
      const currentDate = new Date();

      for (let i = 5; i >= 0; i--) {
        const date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i,
          1
        );
        const monthData = data.find(
          (d) =>
            d._id.year === date.getFullYear() &&
            d._id.month === date.getMonth() + 1
        );

        result.push({
          month: monthNames[date.getMonth()],
          [valueKey]: monthData ? monthData[valueKey] : 0,
        });
      }

      return result;
    };

    const formattedUserGrowth = formatMonthlyData(userGrowthData, "users");
    const formattedRevenue = formatMonthlyData(revenueData, "revenue");

    return NextResponse.json({
      success: true,
      data: {
        userGrowthData: formattedUserGrowth,
        revenueData: formattedRevenue,
        coursePopularityData,
        completionRateData,
      },
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
