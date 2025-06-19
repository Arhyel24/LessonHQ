import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";
import Course from "@/lib/models/Course";
import Purchase from "@/lib/models/Purchase";
import Progress from "@/lib/models/Progress";
import Coupon, { ICoupon } from "@/lib/models/Coupon";
import { createActivity } from "@/lib/utils/activityHelper";

/**
 * POST /api/purchases/free
 * Enroll in a course for free (with 100% discount coupon or free course)
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
    const { courseId, couponCode } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Get course
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if user already purchased this course
    const existingPurchase = await Purchase.findOne({
      user: user._id,
      course: courseId,
      status: "completed",
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: "You are already enrolled in this course" },
        { status: 400 }
      );
    }

    const originalAmount = course.price;
    let finalAmount = originalAmount;
    let discountAmount = 0;
    let appliedCoupon: ICoupon | null = null;
    let enrollmentType = "free";

    // Check if course is free
    if (originalAmount === 0) {
      enrollmentType = "free_course";
    } else if (couponCode) {
      // Validate coupon for 100% discount
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

      if (!coupon) {
        return NextResponse.json(
          { error: "Invalid coupon code" },
          { status: 400 }
        );
      }

      // Validate coupon
      if (!coupon.isValid) {
        return NextResponse.json(
          { error: coupon.message || "This coupon is no longer valid" },
          { status: 400 }
        );
      }

      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return NextResponse.json(
          { error: "This coupon has expired" },
          { status: 400 }
        );
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json(
          { error: "This coupon has reached its usage limit" },
          { status: 400 }
        );
      }

      if (coupon.singleUse && coupon.usedBy.includes(user._id)) {
        return NextResponse.json(
          { error: "You have already used this coupon" },
          { status: 400 }
        );
      }

      if (coupon.minimumAmount && originalAmount < coupon.minimumAmount) {
        return NextResponse.json(
          {
            error: `Minimum purchase amount of $${coupon.minimumAmount} required`,
          },
          { status: 400 }
        );
      }

      if (coupon.applicableCourses && coupon.applicableCourses.length > 0) {
        if (!coupon.applicableCourses.includes(courseId)) {
          return NextResponse.json(
            { error: "This coupon is not applicable to this course" },
            { status: 400 }
          );
        }
      }

      // Calculate discount
      if (coupon.type === "percentage") {
        discountAmount = Math.round((originalAmount * coupon.value) / 100);
      } else {
        discountAmount = Math.min(coupon.value, originalAmount);
      }

      finalAmount = Math.max(0, originalAmount - discountAmount);

      // Only allow free enrollment if discount makes it free
      if (finalAmount > 0) {
        return NextResponse.json(
          { error: "This coupon does not provide free access to the course" },
          { status: 400 }
        );
      }

      appliedCoupon = coupon;
      enrollmentType = "coupon_free";
    } else {
      return NextResponse.json(
        { error: "Course is not free and no valid coupon provided" },
        { status: 400 }
      );
    }

    // Create completed purchase record
    const purchase = new Purchase({
      user: user._id,
      course: courseId,
      amount: originalAmount,
      status: "completed",
      paymentReference: `FREE-${enrollmentType.toUpperCase()}-${Date.now()}-${courseId}`,
      paidAt: new Date(),
    });

    await purchase.save();

    // Create initial progress record
    const progress = new Progress({
      user: user._id,
      course: courseId,
      lessonsCompleted: [],
      percentage: 0,
    });

    await progress.save();

    // Apply coupon if used
    if (appliedCoupon) {
      appliedCoupon.usedCount += 1;
      if (!appliedCoupon.usedBy.includes(user._id)) {
        appliedCoupon.usedBy.push(user._id);
      }

      // Mark as invalid if single use or reached limit
      if (
        appliedCoupon.singleUse ||
        (appliedCoupon.usageLimit &&
          appliedCoupon.usedCount >= appliedCoupon.usageLimit)
      ) {
        appliedCoupon.isValid = false;
        appliedCoupon.message = "This coupon has been used";
      }

      await appliedCoupon.save();
    }

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: 1 },
    });

    // Create activity
    const activityMessage =
      enrollmentType === "free_course"
        ? `You have successfully enrolled in the free course "${course.title}". You can now access all course content.`
        : `You have successfully enrolled in "${course.title}" using coupon ${appliedCoupon?.code} for free access. You can now access all course content.`;

    await createActivity({
      userId: user._id.toString(),
      type: "course_purchased",
      title: "Free Course Enrollment Successful!",
      message: activityMessage,
      data: {
        courseId,
        courseTitle: course.title,
        originalAmount,
        finalAmount: 0,
        discountAmount,
        couponCode: appliedCoupon?.code,
        enrollmentType,
      },
      priority: "high",
      category: "course",
      actionUrl: `/courses/${courseId}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        enrolled: true,
        purchase: {
          id: purchase._id,
          course: {
            id: course._id,
            title: course.title,
            thumbnail: course.thumbnail,
          },
          amount: originalAmount,
          finalAmount: 0,
          discountAmount,
          enrollmentType,
          paidAt: purchase.paidAt,
        },
        couponApplied: appliedCoupon?.code,
      },
      message: `Successfully enrolled in ${course.title}!`,
    });
  } catch (error) {
    console.error("Free enrollment error:", error);
    return NextResponse.json(
      { error: "Failed to enroll in course" },
      { status: 500 }
    );
  }
}
