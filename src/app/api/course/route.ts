import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/connectDB";
import Course from "@/lib/models/Course";
import Purchase from "@/lib/models/Purchase";
import Progress from "@/lib/models/Progress";
import User from "@/lib/models/User";
import { Types } from "mongoose";

/**
 * GET /api/course
 * Get all available courses with enrollment and progress data
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to access this route." },
        { status: 401 }
      );
    }

    await connectDB();

    // Fetch logged-in user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Get all published courses
    const courses = await Course.find({ status: "published" }).lean();

    // Get user's purchases
    const userPurchases = await Purchase.find({
      user: user._id,
      status: "completed",
    }).lean();

    // Get user's progress
    const userProgress = await Progress.find({
      user: user._id,
    }).lean();

    // Create maps for quick lookup
    const purchaseMap = new Map(
      userPurchases.map((p) => [p.course.toString(), p])
    );
    const progressMap = new Map(
      userProgress.map((p) => [p.course.toString(), p])
    );

    // Transform courses
    const transformedCourses = courses.map((course) => {
      const courseId = (course._id as string | Types.ObjectId).toString();
      const purchase = purchaseMap.get(courseId);
      const progress = progressMap.get(courseId);

      const isEnrolled = !!purchase;
      const progressPercentage = progress?.percentage || 0;
      const isCompleted = progressPercentage === 100;

      const totalMinutes =
        course.lessons?.reduce((total: number, lesson: any) => {
          return total + (lesson.duration || 10);
        }, 0) || 0;

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      let badge = "";
      if (isCompleted) badge = "Completed";
      else if (isEnrolled && progressPercentage > 0) badge = "In Progress";
      else if (isEnrolled) badge = "Enrolled";

      return {
        id: courseId,
        title: course.title,
        slug: course.slug,
        description: course.description,
        thumbnail: course.thumbnail,
        icon: course.icon || "📚",
        progress: progressPercentage,
        isEnrolled,
        isCompleted,
        badge,
        duration,
        difficulty: course.difficulty || "Intermediate",
        lessons: course.lessons?.map((lesson: any) => lesson.title) || [],
        instructor: course.instructor || "LearnHQ Team",
        price: course.price,
        originalPrice: course.originalPrice,
        rating: course.rating || 4.8,
        students: course.enrollmentCount || 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedCourses,
    });
  } catch (error) {
    console.error("Courses fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
