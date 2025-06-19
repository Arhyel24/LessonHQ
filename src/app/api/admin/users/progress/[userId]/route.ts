import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/utils/authOptions";
import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";
import Progress from "@/lib/models/Progress";
import Purchase from "@/lib/models/Purchase";

/**
 * GET /api/admin/users/progress/[userId]
 * Get user's course progress (admin only)
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
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

    const { userId } = await context.params;

    // Verify target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's purchases
    const purchases = await Purchase.find({
      user: userId,
      status: "completed",
    })
      .populate("course")
      .lean();

    if (!purchases.length) {
      return NextResponse.json({
        success: true,
        data: {
          courses: [],
        },
      });
    }

    // Get progress for all purchased courses
    const courseIds = purchases.map((p) => p.course._id);
    const progressRecords = await Progress.find({
      user: userId,
      course: { $in: courseIds },
    }).lean();

    // Create progress map
    const progressMap = new Map();
    progressRecords.forEach((progress) => {
      progressMap.set(progress.course.toString(), progress);
    });

    // Transform data to match required format
    const courses = purchases.map((purchase) => {
      const course = purchase.course;
      const progress = progressMap.get(course._id.toString());

      const completedLessons = progress?.lessonsCompleted || [];
      const totalLessons = course.lessons?.length || 0;
      const progressPercentage = progress?.percentage || 0;

      // Create lessons array with completion status
      const lessons =
        course.lessons?.map((lesson: any, index: number) => ({
          id: (index + 1).toString(),
          title: lesson.title,
          completed: completedLessons.includes(index),
        })) || [];

      return {
        id: course._id.toString(),
        title: course.title,
        progress: progressPercentage,
        completedLessons: completedLessons.length,
        totalLessons,
        certificateIssued: progress?.certificateIssued || false,
        lessons,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        courses,
      },
    });
  } catch (error) {
    console.error("User progress fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user progress" },
      { status: 500 }
    );
  }
}
