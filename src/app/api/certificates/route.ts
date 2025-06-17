import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/connectDB';
import User from '@/lib/models/User';
import Progress from '@/lib/models/Progress';
import Purchase from '@/lib/models/Purchase';
import '@/lib/models/Course';

/**
 * GET /api/certificates
 * Get certificate status for all courses the user has started
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all courses the user has purchased
    const purchases = await Purchase.find({
      user: user._id,
      status: 'completed'
    }).populate('course');

    if (!purchases.length) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No purchased courses found'
      });
    }

    // Get progress for all purchased courses
    const courseIds = purchases.map(p => p.course._id);
    const progressRecords = await Progress.find({
      user: user._id,
      course: { $in: courseIds }
    });

    // Create a map of course progress
    const progressMap = new Map();
    progressRecords.forEach(progress => {
      progressMap.set(progress.course.toString(), progress);
    });

    // Build certificate data
    const certificates = purchases.map(purchase => {
      const course = purchase.course;
      const progress = progressMap.get(course._id.toString());
      
      // Check if course is completed (100% progress)
      const isCompleted = progress && progress.percentage === 100;
      const completedDate = progress?.completedAt;

      return {
        id: course._id.toString(),
        courseName: course.title,
        completedDate: completedDate ? completedDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : null,
        available: isCompleted && progress.certificateIssued,
        progress: progress?.percentage || 0,
        lessonsCompleted: progress?.lessonsCompleted?.length || 0,
        totalLessons: course.lessons?.length || 0,
        purchaseDate: purchase.paidAt?.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        certificateIssued: progress?.certificateIssued || false
      };
    });

    // Sort by completion status and date
    certificates.sort((a, b) => {
      // Completed courses first
      if (a.available && !b.available) return -1;
      if (!a.available && b.available) return 1;
      
      // Then by completion date (most recent first)
      if (a.completedDate && b.completedDate) {
        return new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime();
      }
      
      // Then by progress percentage
      return b.progress - a.progress;
    });

    return NextResponse.json({
      success: true,
      data: certificates
    });

  } catch (error) {
    console.error('Certificate fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
      { status: 500 }
    );
  }
}