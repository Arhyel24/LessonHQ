import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/utils/authOptions";
import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";
import Purchase from "@/lib/models/Purchase";

/**
 * GET /api/admin/users
 * Get all users with admin details
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Check if user is admin
    const adminUser = await User.findOne({ email: session.user.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const role = searchParams.get("role");
    // const status = searchParams.get("status");
    const search = searchParams.get("search");
    const simple = searchParams.get("simple") === "true";

    // Build filter query
    const filter: any = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // For simple user list (just id, name, email)
    if (simple) {
      const users = await User.find(filter)
        .select("name email")
        .sort({ name: 1 })
        .lean();

      const simpleUsers = users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      }));

      return NextResponse.json({
        success: true,
        data: simpleUsers,
      });
    }

    // Get users with pagination
    const skip = (page - 1) * limit;
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get enrollment counts for each user
    const userIds = users.map((user) => user._id);
    const enrollmentCounts = await Purchase.aggregate([
      { $match: { user: { $in: userIds }, status: "completed" } },
      { $group: { _id: "$user", count: { $sum: 1 } } },
    ]);

    const enrollmentMap = new Map(
      enrollmentCounts.map((item) => [item._id.toString(), item.count])
    );

    // Transform users to match required interface
    const transformedUsers = users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      referralCode: user.referralCode,
      coursesEnrolled: enrollmentMap.get(user._id.toString()) || 0,
      referralEarnings: user.referralEarnings || 0,
      joinedAt: user.createdAt.toISOString().split("T")[0],
      status: "active",
    }));

    // Get total count for pagination
    const total = await User.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        users: transformedUsers,
        pagination: {
          page,
          limit,
          total,
          pages,
          hasNext: page < pages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
