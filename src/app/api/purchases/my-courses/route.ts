import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/connectDB";
import Purchase from "@/lib/models/Purchase";
import Progress from "@/lib/models/Progress";
import { formatDistanceToNow } from "date-fns";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Get user's completed purchases
    const purchases = await Purchase.find({
      user: session.user.id,
      status: "completed",
    })
      .populate("course", "title slug lessons")
      .sort({ paidAt: -1 });

    // Get progress for each course
    const courseIds = purchases.map((p) => p.course._id);
    const progressRecords = await Progress.find({
      user: session.user.id,
      course: { $in: courseIds },
    });

    // Map course ID to progress
    const progressMap = new Map();
    progressRecords.forEach((progress) => {
      progressMap.set(progress.course.toString(), progress);
    });

    // Build the simplified course data
    const courses = purchases.map((purchase) => {
      const course = purchase.course;
      const progress = progressMap.get(course._id.toString());

      const percentage = progress?.percentage || 0;
      const completedLessons = progress?.lessonsCompleted?.length || 0;
      const totalLessons = course.lessons?.length || 0;
      const lastAccessedAt = progress?.lastAccessedAt
        ? formatDistanceToNow(new Date(progress.lastAccessedAt), {
            addSuffix: true,
          })
        : "Not accessed";

      return {
        id: course._id.toString(),
        title: course.title,
        slug: course.slug,
        progress: percentage,
        completedLessons,
        totalLessons,
        lastAccessedAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("Error fetching simplified course list:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch course progress" },
      { status: 500 }
    );
  }
}
