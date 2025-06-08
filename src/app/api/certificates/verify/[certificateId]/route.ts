import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import User from '@/lib/models/User';
import Course from '@/lib/models/Course';
import Progress from '@/lib/models/Progress';

/**
 * GET /api/certificates/verify/[certificateId]
 * Verify certificate authenticity (public endpoint)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { certificateId: string } }
) {
  try {
    await connectDB();

    // Parse certificate ID (format: userId-courseId)
    const [userId, courseId] = params.certificateId.split('-');
    
    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'Invalid certificate ID format' },
        { status: 400 }
      );
    }

    // Get user, course, and progress
    const [user, course, progress] = await Promise.all([
      User.findById(userId).select('name email'),
      Course.findById(courseId).select('title'),
      Progress.findOne({
        user: userId,
        course: courseId,
        certificateIssued: true
      })
    ]);

    if (!user || !course || !progress) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Certificate not found or not issued'
        },
        { status: 404 }
      );
    }

    // Verify completion
    if (progress.percentage < 100) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Course not completed'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      data: {
        certificateId: params.certificateId,
        studentName: user.name,
        studentEmail: user.email,
        courseName: course.title,
        completedDate: progress.completedAt?.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        issuedDate: progress.updatedAt?.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        verificationUrl: `${process.env.NEXTAUTH_URL}/certificates/verify/${params.certificateId}`
      }
    });

  } catch (error) {
    console.error('Certificate verification error:', error);
    return NextResponse.json(
      { 
        valid: false,
        error: 'Failed to verify certificate'
      },
      { status: 500 }
    );
  }
}