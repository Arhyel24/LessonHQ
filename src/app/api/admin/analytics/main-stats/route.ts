import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";
import Purchase from "@/lib/models/Purchase";
import Progress from "@/lib/models/Progress";

// Helper to calculate % change
function calculateChange(current: number, previous: number): string {
  if (previous === 0 && current === 0) return "0%";
  if (previous === 0) return "+100%";
  const diff = current - previous;
  const change = (diff / previous) * 100;
  return (change >= 0 ? "+" : "") + change.toFixed(0) + "%";
}

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

    const currentDate = new Date();
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

    const getStartOfMonth = (offset: number) =>
      new Date(currentDate.getFullYear(), currentDate.getMonth() - offset, 1);

    const getEndOfMonth = (offset: number) => {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - offset + 1,
        0
      );
      date.setHours(23, 59, 59, 999);
      return date;
    };

    const getMonthlyCompletionRate = async (offset: number) => {
      const start = getStartOfMonth(offset);
      const end = getEndOfMonth(offset);

      const total = await Purchase.countDocuments({
        status: "completed",
        createdAt: { $gte: start, $lte: end },
      });

      const completed = await Progress.countDocuments({
        percentage: 100,
        createdAt: { $gte: start, $lte: end },
      });

      return total > 0 ? Math.round((completed / total) * 100) : 0;
    };

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 6);

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

    const formatMonthlyData = (data: any[], valueKey: "users" | "revenue") => {
      const result: { month: string; [key: string]: number | string }[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i,
          1
        );
        const match = data.find(
          (d) =>
            d._id.year === date.getFullYear() &&
            d._id.month === date.getMonth() + 1
        );
        result.push({
          month: monthNames[date.getMonth()],
          [valueKey]: match ? match[valueKey] : 0,
        });
      }
      return result;
    };

    const formattedRevenue = formatMonthlyData(revenueData, "revenue");
    const formattedUsers = formatMonthlyData(userGrowthData, "users");

    const currentMonthRevenue = Number(formattedRevenue.at(-1)?.revenue || 0);
    const lastMonthRevenue = Number(formattedRevenue.at(-2)?.revenue || 0);

    const currentMonthUsers = Number(formattedUsers.at(-1)?.users || 0);
    const lastMonthUsers = Number(formattedUsers.at(-2)?.users || 0);

    const currentMonthAvgRevenuePerUser =
      currentMonthUsers > 0 ? currentMonthRevenue / currentMonthUsers : 0;
    const lastMonthAvgRevenuePerUser =
      lastMonthUsers > 0 ? lastMonthRevenue / lastMonthUsers : 0;

    const currentMonthCompletionRate = await getMonthlyCompletionRate(0);
    const lastMonthCompletionRate = await getMonthlyCompletionRate(1);

    const mainStats = [
      {
        title: "Total Revenue",
        value: formatCurrency(currentMonthRevenue),
        change: calculateChange(currentMonthRevenue, lastMonthRevenue),
        changeColor: currentMonthRevenue >= lastMonthRevenue ? "green" : "red",
        icon: "DollarSign",
      },
      {
        title: "Active Students",
        value: `${currentMonthUsers}`,
        change: calculateChange(currentMonthUsers, lastMonthUsers),
        changeColor: currentMonthUsers >= lastMonthUsers ? "blue" : "red",
        icon: "Users",
      },
      {
        title: "Course Completion",
        value: `${currentMonthCompletionRate}%`,
        change: calculateChange(
          currentMonthCompletionRate,
          lastMonthCompletionRate
        ),
        changeColor:
          currentMonthCompletionRate >= lastMonthCompletionRate
            ? "purple"
            : "red",
        icon: "BookOpen",
      },
      {
        title: "Avg. Revenue/User",
        value: formatCurrency(currentMonthAvgRevenuePerUser),
        change: calculateChange(
          currentMonthAvgRevenuePerUser,
          lastMonthAvgRevenuePerUser
        ),
        changeColor:
          currentMonthAvgRevenuePerUser >= lastMonthAvgRevenuePerUser
            ? "orange"
            : "red",
        icon: "TrendingUp",
      },
      ];
      
      console.log("Main stats:", mainStats);

    return NextResponse.json({ success: true, data: mainStats });
  } catch (error) {
    console.error("Main stats fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch main stats" },
      { status: 500 }
    );
  }
}

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000)
    return `₦${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(1)}K`;
  return `₦${amount.toFixed(0)}`;
}
