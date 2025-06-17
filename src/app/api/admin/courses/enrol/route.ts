import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";
import Course from "@/lib/models/Course";
import Purchase from "@/lib/models/Purchase";
import Progress from "@/lib/models/Progress";
import { createActivity } from "@/lib/utils/activityHelper";

/**
 * GET /api/admin/course/enrol
 * Get enrollment data and available courses (admin only)
 */
export async function GET(req: Request) {
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

    // Parse pagination from URL
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Total count before pagination
    const totalEnrollments = await Purchase.countDocuments({
      status: "completed",
    });

    // Paginated query
    const enrollments = await Purchase.find({ status: "completed" })
      .populate("user", "name email")
      .populate("course", "title lessons")
      .sort({ paidAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const progressRecords = await Progress.find({
      user: { $in: enrollments.map((e) => e.user._id) },
    }).lean();

    const progressMap = new Map();
    progressRecords.forEach((progress) => {
      const key = `${progress.user}-${progress.course}`;
      progressMap.set(key, progress);
    });

    const enrollmentData = enrollments.map((enrollment) => {
      const progressKey = `${enrollment.user._id}-${enrollment.course._id}`;
      const progress = progressMap.get(progressKey);

      return {
        id: (enrollment._id as string).toString(),
        studentName: enrollment.user.name,
        studentEmail: enrollment.user.email,
        courseName: enrollment.course.title,
        enrolledAt:
          enrollment.paidAt?.toISOString().split("T")[0] ||
          enrollment.createdAt.toISOString().split("T")[0],
        progress: progress?.percentage || 0,
        status: "active",
        completedLessons: progress?.lessonsCompleted?.length || 0,
        totalLessons: enrollment.course.lessons?.length || 0,
      };
    });

    const courses = await Course.find({ status: "published" })
      .select("title")
      .sort({ title: 1 })
      .lean();

    const courseOptions = courses.map((course) => ({
      id: (course._id as string).toString(),
      name: course.title,
    }));

    return NextResponse.json({
      success: true,
      data: {
        enrollments: enrollmentData,
        courses: courseOptions,
        pagination: {
          page,
          limit,
          totalEnrollments,
          totalPages: Math.ceil(totalEnrollments / limit),
        },
      },
    });
  } catch (error) {
    console.error("Enrollment data fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollment data" },
      { status: 500 }
    );
  }
}


/**
 * POST /api/admin/course/enrol
 * Manually enroll existing user to courses (admin only)
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { studentId, courseIds } = body;

    if (
      !studentId ||
      !courseIds ||
      !Array.isArray(courseIds) ||
      courseIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Student ID and course IDs are required" },
        { status: 400 }
      );
    }
  
      
      console.log("Firt check passed");

    // Verify student exists
    const student = await User.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }
      
      console.log("Student found:", student.name);

    // Verify courses exist
    const courses = await Course.find({
      _id: { $in: courseIds },
      status: "published",
    });

    if (courses.length !== courseIds.length) {
      return NextResponse.json(
        { error: "One or more courses not found or not published" },
        { status: 404 }
      );
      }
      
      console.log("Courses found:", courses.map(c => c.title).join(", "));

    const enrolledCourses: string[] = [];
    const skippedCourses: string[] = [];

    for (const course of courses) {
      // Check if student is already enrolled
      const existingPurchase = await Purchase.findOne({
        user: studentId,
        course: course._id,
        status: "completed",
      });

      if (existingPurchase) {
        skippedCourses.push(course.title);
        continue;
      }

      // Create purchase record
      const purchase = new Purchase({
        user: studentId,
        course: course._id,
        amount: course.price,
        status: "completed",
        paymentReference: `ADMIN-${Date.now()}-${course._id}`,
        paidAt: new Date(),
      });

      await purchase.save();

      // Create initial progress record
      const progress = new Progress({
        user: studentId,
        course: course._id,
        lessonsCompleted: [],
        percentage: 0,
      });

      await progress.save();

      // Create activity for student
      await createActivity({
        userId: studentId,
        type: "course_purchased",
        title: "Course Enrolled by Admin",
        message: `You have been enrolled in "${course.title}" by an administrator. You can now access all course content.`,
        data: {
          courseId: course._id,
          courseTitle: course.title,
          enrolledByAdmin: true,
        },
        priority: "high",
        category: "course",
        actionUrl: `/courses/${course._id}`,
      });

      enrolledCourses.push(course.title);
    }

    // Create activity for admin
    await createActivity({
      userId: adminUser._id.toString(),
      type: "system_announcement",
      title: "Student Enrolled in Courses",
      message: `You enrolled ${student.name} in ${
        enrolledCourses.length
      } course(s): ${enrolledCourses.join(", ")}.`,
      data: {
        studentId: studentId,
        studentName: student.name,
        enrolledCourses,
        skippedCourses,
      },
      priority: "medium",
      category: "system",
    });

    return NextResponse.json({
      success: true,
      data: {
        enrolledCourses: enrolledCourses.length,
        skippedCourses: skippedCourses.length,
        enrolledCourseTitles: enrolledCourses,
        skippedCourseTitles: skippedCourses,
      },
      message: `Successfully enrolled student in ${enrolledCourses.length} course(s). ${skippedCourses.length} course(s) were skipped (already enrolled).`,
    });
  } catch (error) {
    console.error("Manual enrollment error:", error);
    return NextResponse.json(
      { error: "Failed to enroll student" },
      { status: 500 }
    );
  }
}
