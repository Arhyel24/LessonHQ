import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/connectDB';
import Course from '@/lib/models/Course';
import Purchase from '@/lib/models/Purchase';
import Progress from '@/lib/models/Progress';
import User from '@/lib/models/User';

/**
 * GET /api/courses
 * Get all available courses with enrollment and progress data
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    await connectDB();

    // Get all published courses
    const courses = await Course.find({ status: 'published' }).lean();

    let userPurchases: any[] = [];
    let userProgress: any[] = [];
    let user = null;

    // If user is logged in, get their purchase and progress data
    if (session?.user?.email) {
      user = await User.findOne({ email: session.user.email });
      
      if (user) {
        // Get user's purchases
        userPurchases = await Purchase.find({
          user: user._id,
          status: 'completed'
        }).lean();

        // Get user's progress
        userProgress = await Progress.find({
          user: user._id
        }).lean();
      }
    }

    // Create maps for quick lookup
    const purchaseMap = new Map(userPurchases.map(p => [p.course.toString(), p]));
    const progressMap = new Map(userProgress.map(p => [p.course.toString(), p]));

    // Transform courses to match the required interface
    const transformedCourses = courses.map(course => {
      const courseId = course.id.toString();
      const purchase = purchaseMap.get(courseId);
      const progress = progressMap.get(courseId);
      
      const isEnrolled = !!purchase;
      const progressPercentage = progress?.percentage || 0;
      const isCompleted = progressPercentage === 100;

      // Calculate estimated duration based on lessons
      const totalMinutes = course.lessons?.reduce((total: number, lesson: any) => {
        // Estimate 10 minutes per lesson if no duration specified
        return total + (lesson.duration || 10);
      }, 0) || 0;
      
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      // Determine badge based on completion and enrollment
      let badge = undefined;
      if (isCompleted) {
        badge = 'Completed';
      } else if (isEnrolled && progressPercentage > 0) {
        badge = 'In Progress';
      } else if (isEnrolled) {
        badge = 'Enrolled';
      }

      return {
          id: courseId,
          title: course.title,
          slug: course.slug,
        description: course.description,
        thumbnail: course.thumbnail,
        icon: course.icon || '📚', 
        progress: progressPercentage,
        isEnrolled,
        isCompleted,
        badge,
        duration,
        difficulty: course.difficulty || 'Intermediate',
        modules: course.lessons?.map((lesson: any) => lesson.title) || [],
        instructor: course.instructor || 'MIC Team',
        price: course.price,
        originalPrice: course.originalPrice,
        rating: course.rating || 4.8,
        students: course.enrollmentCount || 0
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedCourses
    });

  } catch (error) {
    console.error('Courses fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses
 * Create a new course (admin only)
 */
export async function POST(request: NextRequest) {
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
      requiresCompletionForDownload = true
    } = body;

    // Validate required fields
    if (!title || !slug || !description || !thumbnail || !price || !lessons) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCourse = await Course.findOne({ slug });
    if (existingCourse) {
      return NextResponse.json(
        { error: 'Course slug already exists' },
        { status: 400 }
      );
    }

    // Create new course
    const course = new Course({
      title,
      slug,
      description,
      thumbnail,
      icon: icon || '📚',
      price,
      originalPrice,
      lessons,
      difficulty: difficulty || 'Intermediate',
      instructor: instructor || 'MIC Team',
      requiresCompletionForDownload,
      status: 'published',
      enrollmentCount: 0,
      rating: 4.8
    });

    await course.save();

    return NextResponse.json({
      success: true,
      data: course,
      message: 'Course created successfully'
    });

  } catch (error) {
    console.error('Course creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}