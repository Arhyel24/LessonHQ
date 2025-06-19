import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/utils/authOptions";

import connectDB from "@/lib/connectDB";
import Purchase from "@/lib/models/Purchase";
import Progress from "@/lib/models/Progress";
import "@/lib/models/Course"; // Ensure Course model is imported for population
import { formatDistanceToNow } from "date-fns";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Parallelize queries
    const [purchases, progressRecords] = await Promise.all([
      Purchase.find({
        user: session.user.id,
        status: "completed",
      })
        .populate({
          path: "course",
          select: "title slug lessons",
          options: { lean: true },
        })
        .sort({ paidAt: -1 })
        .lean(),

      Progress.find({
        user: session.user.id,
      }).lean(),
    ]);

    if (!purchases || purchases.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const progressMap = new Map<string, any>();
    for (const progress of progressRecords) {
      progressMap.set(progress.course.toString(), progress);
    }

    const courses = purchases.map((purchase) => {
      const course = purchase.course as {
        _id: string;
        title: string;
        slug: string;
        lessons?: any[];
      };

      const progress = progressMap.get(course._id.toString());
      const totalLessons = course.lessons?.length || 0;
      const completedLessons = progress?.lessonsCompleted?.length || 0;
      const percentage = progress?.percentage || 0;
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
    console.error("[COURSE_LIST_API_ERROR]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch course progress" },
      { status: 500 }
    );
  }
}
