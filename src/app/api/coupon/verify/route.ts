import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/connectDB";
import Coupon from "@/lib/models/Coupon";
import User from "@/lib/models/User";

/**
 * POST /api/admin/coupons/verify
 * Verify coupon validity and apply discount
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
    const { code, courseId, amount } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    // Find coupon
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return NextResponse.json({
        success: true,
        data: {
          isValid: false,
          message: "Invalid coupon code",
        },
      });
    }

    // Check if coupon is disabled
    if (!coupon.isValid) {
      return NextResponse.json({
        success: true,
        data: {
          isValid: false,
          message: coupon.message || "This coupon is no longer valid",
        },
      });
    }

    // Check if coupon has expired
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({
        success: true,
        data: {
          isValid: false,
          message: "This coupon has expired",
        },
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({
        success: true,
        data: {
          isValid: false,
          message: "This coupon has reached its usage limit",
        },
      });
    }

    // Check if user has already used this coupon (for single-use coupons)
    if (coupon.singleUse && coupon.usedBy.includes(user._id)) {
      return NextResponse.json({
        success: true,
        data: {
          isValid: false,
          message: "You have already used this coupon",
        },
      });
    }

    // Check minimum amount requirement
    if (amount && coupon.minimumAmount && amount < coupon.minimumAmount) {
      return NextResponse.json({
        success: true,
        data: {
          isValid: false,
          message: `Minimum purchase amount of $${coupon.minimumAmount} required`,
        },
      });
    }

    // Ensure all applicableCourse ids are strings before checking
    if (coupon.applicableCourses && coupon.applicableCourses.length > 0) {
      const isApplicable = coupon.applicableCourses
        .map((id) => id.toString())
        .includes(courseId);
      
      if (!isApplicable) {
        return NextResponse.json({
          success: true,
          data: {
            isValid: false,
            message: "This coupon is not applicable to this course",
          },
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (amount) {
      if (coupon.type === "percentage") {
        discountAmount = Math.round((amount * coupon.value) / 100);
      } else {
        discountAmount = Math.min(coupon.value, amount);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        isValid: true,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount,
        message: `Coupon applied! You save $${discountAmount}`,
      },
    });
  } catch (error) {
    console.error("Coupon verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify coupon" },
      { status: 500 }
    );
  }
}
