import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/connectDB';
import Course from '@/lib/models/Course';
import Purchase from '@/lib/models/Purchase';
import Progress from '@/lib/models/Progress';
import User from '@/lib/models/User';

/**
 * GET /api/courses/[id]
 * Get specific course by ID with enrollment and progress data
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await getServerSession(authOptions);
  
      await connectDB();
  
      // Fetch course by ID
      const course = await Course.findById(params.id).lean();
      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
  
      let purchase = null;
      let progress = null;
      let user = null;
  
      if (session?.user?.email) {
        user = await User.findOne({ email: session.user.email });
  
        if (user) {
          // Check if user has completed purchase for the course
          purchase = await Purchase.findOne({
            user: user._id,
            course: params.id,
            status: "completed",
          }).lean();
  
          // Fetch user's progress on this course
          progress = await Progress.findOne({
            user: user._id,
            course: params.id,
          }).lean();
        }
      }
  
      const isEnrolled = Boolean(purchase);
      const progressPercentage = progress?.percentage ?? 0;
      const isCompleted = progressPercentage === 100;
  
      // Calculate total duration in minutes (fallback to 10 if undefined)
      const totalMinutes =
        course.lessons?.reduce(
          (total: number, lesson: any) => total + (lesson.duration ?? 10),
          0
        ) ?? 0;
  
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  
      // Badge logic
      let badge: string | undefined;
      if (isCompleted) {
        badge = "Completed";
      } else if (isEnrolled && progressPercentage > 0) {
        badge = "In Progress";
      } else if (isEnrolled) {
        badge = "Enrolled";
      }
  
      // Transform course data to desired shape
      const transformedCourse = {
        id: course._id.toString(),
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
        modules: course.lessons?.map((lesson: any) => lesson.title) ?? [],
        instructor: course.instructor || "MIC Team",
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Check if user is admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    
    // Update course
    const course = await Course.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: course,
      message: 'Course updated successfully'
    });

  } catch (error) {
    console.error('Course update error:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Check if user is admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check if course has any purchases
    const purchaseCount = await Purchase.countDocuments({ course: params.id });
    if (purchaseCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with existing purchases' },
        { status: 400 }
      );
    }

    // Delete course
    const course = await Course.findByIdAndDelete(params.id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Clean up related progress records
    await Progress.deleteMany({ course: params.id });

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Course deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}