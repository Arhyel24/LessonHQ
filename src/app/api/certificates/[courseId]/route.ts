import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/connectDB';
import User from '@/lib/models/User';
import Course from '@/lib/models/Course';
import Progress from '@/lib/models/Progress';
import Purchase from '@/lib/models/Purchase';
import { generateCertificate } from '@/lib/generateCertificate';

/**
 * GET /api/certificates/[courseId]
 * Get or download certificate for a specific course
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await context.params;

    await connectDB();

    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Verify user has purchased the course
    const purchase = await Purchase.findOne({
      user: user._id,
      course: courseId,
      status: "completed",
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Course not purchased or payment not completed" },
        { status: 403 }
      );
    }

    // Get progress
    const progress = await Progress.findOne({
      user: user._id,
      course: courseId,
    });

    if (!progress || progress.percentage < 100) {
      return NextResponse.json(
        {
          error:
            "Course not completed. Complete all lessons to get certificate.",
        },
        { status: 400 }
      );
    }

    // Check if certificate download is requested
    const { searchParams } = new URL(request.url);
    const download = searchParams.get("download") === "true";

    if (download) {
      try {
        // Generate certificate PDF
        const certificateBuffer = await generateCertificate({
          studentName: user.name,
          courseName: course.title,
          completionDate: progress.completedAt || new Date(),
          certificateId: `${user._id}-${course._id}`,
          instructorName: "Coach Adams",
        });

        // Mark certificate as issued if not already
        if (!progress.certificateIssued) {
          progress.certificateIssued = true;
          await progress.save();
        }

        // Return PDF as download
        return new NextResponse(certificateBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="certificate-${course.title.replace(
              /[^a-zA-Z0-9]/g,
              "-"
            )}.pdf"`,
            "Content-Length": certificateBuffer.length.toString(),
          },
        });
      } catch (error) {
        console.error("Certificate generation error:", error);
        return NextResponse.json(
          { error: "Failed to generate certificate" },
          { status: 500 }
        );
      }
    }

    // Return certificate information
    return NextResponse.json({
      success: true,
      data: {
        id: course._id.toString(),
        courseName: course.title,
        studentName: user.name,
        completedDate: progress.completedAt?.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        available: true,
        certificateIssued: progress.certificateIssued,
        certificateId: `${user._id}-${course._id}`,
        downloadUrl: `/api/certificates/${courseId}?download=true`,
      },
    });
  } catch (error) {
    console.error("Certificate fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificate" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/certificates/[courseId]
 * Issue/reissue certificate for a course (admin only)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await context.params;

    await connectDB();

    // Get user and verify admin role
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, forceIssue = false } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Verify target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    // Get or create progress record
    let progress = await Progress.findOne({
      user: userId,
      course: courseId,
    });

    if (!progress) {
      // Create progress record if it doesn't exist
      progress = new Progress({
        user: userId,
        course: courseId,
        lessonsCompleted: Array.from(
          { length: course.lessons.length },
          (_, i) => i
        ),
        percentage: 100,
        completedAt: new Date(),
        certificateIssued: false,
      });
    }

    // Force completion if admin requests it
    if (forceIssue) {
      progress.percentage = 100;
      progress.completedAt = progress.completedAt || new Date();
      progress.lessonsCompleted = Array.from(
        { length: course.lessons.length },
        (_, i) => i
      );
    }

    // Check if course is completed
    if (progress.percentage < 100 && !forceIssue) {
      return NextResponse.json(
        { error: "Course not completed. Use forceIssue=true to override." },
        { status: 400 }
      );
    }

    // Issue certificate
    progress.certificateIssued = true;
    await progress.save();

    return NextResponse.json({
      success: true,
      data: {
        certificateIssued: true,
        studentName: targetUser.name,
        courseName: course.title,
        completedDate: progress.completedAt,
      },
      message: "Certificate issued successfully",
    });
  } catch (error) {
    console.error("Certificate issuance error:", error);
    return NextResponse.json(
      { error: "Failed to issue certificate" },
      { status: 500 }
    );
  }
}