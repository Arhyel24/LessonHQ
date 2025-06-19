import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/connectDB";
import Course from "@/lib/models/Course";
import Purchase from "@/lib/models/Purchase";
import User from "@/lib/models/User";
import Progress from "@/lib/models/Progress";

/**
 * GET /api/admin/courses
 * Get all courses with admin details
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Check if user is admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build filter query
    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Get courses with pagination
    const skip = (page - 1) * limit;
    const courses = await Course.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get enrollment counts for each course
    const courseIds = courses.map((course) => course._id);
    const enrollmentCounts = await Purchase.aggregate([
      { $match: { course: { $in: courseIds }, status: "completed" } },
      { $group: { _id: "$course", count: { $sum: 1 } } },
    ]);

    const enrollmentMap = new Map(
      enrollmentCounts.map((item) => [item._id.toString(), item.count])
    );

    // Transform courses to match required interface
    const transformedCourses = courses.map((course) => {
      const courseId = String(course._id); // Safely cast to string

      return {
        id: courseId,
        title: course.title,
        slug: course.slug,
        price: course.price,
        students: enrollmentMap.get(courseId) || 0,
        lessons: course.lessons?.length || 0,
        status:
          course.status === "published"
            ? "Published"
            : course.status === "draft"
            ? "Draft"
            : "Archived",
        createdAt: course.createdAt.toISOString().split("T")[0],
      };
    });

    // Get total count for pagination
    const total = await Course.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        courses: transformedCourses,
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
    console.error("Admin courses fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/courses
 * Create a new course
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      title,
      slug,
      description,
      thumbnail,
      icon,
      price,
      originalPrice,
      lessons,
      difficulty,
      instructor,
      status = "draft",
      requiresCompletionForDownload = false,
    } = body;

    if (!title || !slug || !description || !thumbnail || !price || !lessons) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingCourse = await Course.findOne({ slug });
    if (existingCourse) {
      return NextResponse.json(
        { error: "Course slug already exists" },
        { status: 400 }
      );
    }

    // Ensure lessons are correctly typed
    const formattedLessons = lessons.map((lesson: any, index: number) => ({
      title: lesson.title || "",
      videoUrl: lesson.videoUrl || "",
      textContent: lesson.textContent || lesson.content || "",
      duration: lesson.duration || 0,
      order: lesson.order ?? index + 1,
    }));

    const course = new Course({
      title,
      slug,
      description,
      thumbnail,
      icon: icon || "📚",
      price,
      originalPrice,
      lessons: formattedLessons,
      difficulty: difficulty || "Intermediate",
      instructor: instructor || "LearnHQ Team",
      status,
      enrollmentCount: 0,
      rating: 4.8,
      requiresCompletionForDownload,
    });

    await course.save();

    return NextResponse.json({
      success: true,
      data: {
        id: course._id.toString(),
        title: course.title,
        slug: course.slug,
        price: course.price,
        students: 0,
        lessons: course.lessons.length,
        status:
          course.status === "published"
            ? "Published"
            : course.status === "draft"
            ? "Draft"
            : "Archived",
        createdAt: course.createdAt.toISOString().split("T")[0],
      },
      message: "Course created successfully",
    });
  } catch (error) {
    console.error("Course creation error:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/courses/[id]
 * Update course (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Check if user is admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Update course
    const course = await Course.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: course,
      message: "Course updated successfully",
    });
  } catch (error) {
    console.error("Course update error:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/courses/[id]
 * Delete course (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    await connectDB();

    // Check if user is admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Check if course has any purchases
    const purchaseCount = await Purchase.countDocuments({ course: id });
    if (purchaseCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete course with existing purchases" },
        { status: 400 }
      );
    }

    // Delete course
    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Clean up related progress records
    await Progress.deleteMany({ course: id });

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Course deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
