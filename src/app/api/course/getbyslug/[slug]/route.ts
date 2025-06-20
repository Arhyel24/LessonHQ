import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/utils/authOptions";
import connectDB from "@/lib/connectDB";
import Course, { ICourse } from "@/lib/models/Course";
import Purchase, { IPurchase } from "@/lib/models/Purchase";
import Progress, { IProgress } from "@/lib/models/Progress";
import User, { IUser } from "@/lib/models/User";

/**
 * GET /api/courses/getbyslug/[slug]
 * Get specific course by slug with enrollment and progress data
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    await connectDB();

    const { slug } = await context.params;

    const course = await Course.findOne({ slug }).lean<ICourse>();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    let user: IUser | null = null;
    let purchase: IPurchase | null = null;
    let progress: IProgress | null = null;

    if (session?.user?.email) {
      user = await User.findOne({ email: session.user.email });

      if (user) {
        purchase = await Purchase.findOne({
          user: user._id,
          course: course._id,
          status: "completed",
        }).lean<IPurchase>();

        progress = await Progress.findOne({
          user: user._id,
          course: course._id,
        }).lean<IProgress>();
      }
    }

    const isEnrolled = Boolean(purchase);
    const progressPercentage = progress?.percentage ?? 0;
    const isCompleted = progressPercentage === 100;

    const totalMinutes =
      course.lessons?.reduce(
        (total, lesson) => total + (lesson.duration ?? 10),
        0
      ) ?? 0;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    let badge: string | undefined;
    if (isCompleted) badge = "Completed";
    else if (isEnrolled && progressPercentage > 0) badge = "In Progress";
    else if (isEnrolled) badge = "Enrolled";

    const transformedCourse = {
      id: (course._id as string).toString(),
      slug: course.slug,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      icon: course.icon || "📚",
      progress: progressPercentage,
      isEnrolled,
      isCompleted,
      badge,
      duration,
      difficulty: course.difficulty || "Intermediate",
      modules: course.lessons?.map((l) => l.title) ?? [],
      instructor: course.instructor || "LearnHQ Team",
      price: course.price,
      originalPrice: course.originalPrice,
      rating: course.rating ?? 4.8,
      students: course.enrollmentCount ?? 0,
      lessons: course.lessons,
      requiresCompletionForDownload: course.requiresCompletionForDownload,
      createdAt: course.createdAt,
      ...(progress && {
        lessonsCompleted: progress.lessonsCompleted,
        completedAt: progress.completedAt,
        certificateIssued: progress.certificateIssued,
      }),
    };

    return NextResponse.json({
      success: true,
      data: transformedCourse,
    });
  } catch (error) {
    console.error("Course fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}
