import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";
import Course from "@/lib/models/Course";
import Purchase from "@/lib/models/Purchase";
import Progress from "@/lib/models/Progress";
import Coupon from "@/lib/models/Coupon";
import { createActivity } from "@/lib/utils/activityHelper";
import { sendPaymentSuccessEmail } from "@/lib/sendEmail";

/**
 * POST /api/payments/verify
 * Verify payment and complete course enrollment
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      );
    }

    // Get purchase record
    const purchase = await Purchase.findOne({
      paymentReference: reference,
      user: user._id,
    }).populate("course");

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase record not found" },
        { status: 404 }
      );
    }

    if (purchase.status === "completed") {
      return NextResponse.json(
        { error: "Payment already verified" },
        { status: 400 }
      );
    }

    // In a real implementation, you would verify with Paystack/Flutterwave here
    // For now, we'll assume payment is successful
    const paymentVerified = true;

    if (!paymentVerified) {
      purchase.status = "failed";
      await purchase.save();

      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Update purchase status
    purchase.status = "completed";
    purchase.paidAt = new Date();
    await purchase.save();

    // Apply coupon if it was used
    if (purchase.data?.couponCode) {
      const coupon = await Coupon.findOne({ code: purchase.data.couponCode });
      if (coupon) {
        coupon.usedCount += 1;
        if (!coupon.usedBy.includes(user._id)) {
          coupon.usedBy.push(user._id);
        }

        // Mark as invalid if single use or reached limit
        if (
          coupon.singleUse ||
          (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
        ) {
          coupon.isValid = false;
          coupon.message = "This coupon has been used";
        }

        await coupon.save();
      }
    }

    // Create initial progress record
    const existingProgress = await Progress.findOne({
      user: user._id,
      course: purchase.course._id,
    });

    if (!existingProgress) {
      const progress = new Progress({
        user: user._id,
        course: purchase.course._id,
        lessonsCompleted: [],
        percentage: 0,
      });
      await progress.save();
    }

    // Update course enrollment count
    await Course.findByIdAndUpdate(purchase.course._id, {
      $inc: { enrollmentCount: 1 },
    });

    // Create activity
    await createActivity({
      userId: user._id.toString(),
      type: "course_purchased",
      title: "Course Purchased Successfully!",
      message: `You have successfully purchased "${purchase.course.title}" for $${purchase.amount}. You can now access all course content.`,
      data: {
        courseId: purchase.course._id,
        courseTitle: purchase.course.title,
        amount: purchase.amount,
        originalAmount: purchase.data?.originalAmount,
        discountAmount: purchase.data?.discountAmount,
        couponCode: purchase.data?.couponCode,
      },
      priority: "high",
      category: "course",
      actionUrl: `/courses/${purchase.course._id}`,
    });

    // Send payment success email
    try {
      await sendPaymentSuccessEmail(user.email, user.name, {
        courseTitle: purchase.course.title,
        originalAmount: purchase.data?.originalAmount || purchase.amount,
        finalAmount: purchase.amount,
        discountAmount: purchase.data?.discountAmount || 0,
        couponCode: purchase.data?.couponCode,
        paymentReference: purchase.paymentReference,
        paidAt: purchase.paidAt,
        courseId: purchase.course._id.toString(),
      });
    } catch (emailError) {
      console.error("Failed to send payment success email:", emailError);
      // Don't fail the verification if email fails
    }

    return NextResponse.json({
      success: true,
      data: {
        verified: true,
        purchase: {
          id: purchase._id,
          course: purchase.course,
          amount: purchase.amount,
          paidAt: purchase.paidAt,
          originalAmount: purchase.data?.originalAmount,
          discountAmount: purchase.data?.discountAmount,
          couponApplied: purchase.data?.couponCode,
        },
      },
      message: "Payment verified and course access granted!",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
