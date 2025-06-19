import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/utils/authOptions";
import connectDB from "@/lib/connectDB";
import Coupon from "@/lib/models/Coupon";
import User from "@/lib/models/User";
import Course from "@/lib/models/Course";

/**
 * GET /api/admin/coupons
 * Get all coupons (admin only)
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
    const status = searchParams.get("status"); // 'active', 'expired', 'disabled'
    const search = searchParams.get("search");

    // Build filter query
    const filter: any = {};

    if (status === "active") {
      filter.isValid = true;
      filter.$or = [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }];
    } else if (status === "expired") {
      filter.expiresAt = { $lt: new Date() };
    } else if (status === "disabled") {
      filter.isValid = false;
    }

    if (search) {
      filter.code = { $regex: search, $options: "i" };
    }

    // Get coupons with pagination
    const skip = (page - 1) * limit;
    const coupons = await Coupon.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform coupons to match required format
    const transformedCoupons = coupons.map((coupon) => ({
      id: (coupon._id as string).toString(),
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      isValid:
        coupon.isValid && (!coupon.expiresAt || coupon.expiresAt > new Date()),
      message: coupon.message,
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount,
      singleUse: coupon.singleUse,
      minimumAmount: coupon.minimumAmount,
      expiresAt: coupon.expiresAt?.toISOString(),
      createdBy: coupon.createdBy?.name || "Unknown",
      createdAt: coupon.createdAt.toISOString().split("T")[0],
    }));

    // Get total count for pagination
    const total = await Coupon.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    const [totalCoupons, activeCoupons, totalUsage, expiringSoonCount] =
      await Promise.all([
        // Total number of coupons
        Coupon.countDocuments(),

        // Active = valid and not expired
        Coupon.countDocuments({
          isValid: true,
          $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
        }),

        // Total number of uses across all coupons
        Coupon.aggregate([
          { $group: { _id: null, totalUsed: { $sum: "$usedCount" } } },
        ]).then((res) => res[0]?.totalUsed || 0),

        // Coupons expiring within the next 7 days
        Coupon.countDocuments({
          expiresAt: {
            $gt: new Date(),
            $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        }),
      ]);

    // Get all courses for enrollment dropdown
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
        coupons: transformedCoupons,
        courses: courseOptions,
        metrics: {
          totalCoupons,
          activeCoupons,
          totalUsage,
          expiringSoonCount,
        },
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
    console.error("Coupons fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/coupons
 * Create a new coupon (admin only)
 */
export async function POST(request: NextRequest) {
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
    const {
      code,
      type,
      value,
      usageLimit,
      singleUse = false,
      applicableCourses,
      minimumAmount = 0,
      expiresAt,
      message = "", // Optional message for user-facing info
    } = body;

    // Validate required fields
    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { error: "Code, type, and value are required" },
        { status: 400 }
      );
    }

    // Validate coupon type and value
    if (!["percentage", "fixed"].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "percentage" or "fixed"' },
        { status: 400 }
      );
    }

    if (type === "percentage" && (value < 0 || value > 100)) {
      return NextResponse.json(
        { error: "Percentage value must be between 0 and 100" },
        { status: 400 }
      );
    }

    if (value < 0) {
      return NextResponse.json(
        { error: "Value must be positive" },
        { status: 400 }
      );
    }

    // Check for uniqueness
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    const now = new Date();

    const coupon = new Coupon({
      code: code.toUpperCase(),
      type,
      value,
      isValid: true, // default to active
      message,
      usageLimit: usageLimit || null,
      usedCount: 0,
      singleUse,
      usedBy: [],
      applicableCourses: applicableCourses || null,
      minimumAmount,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await coupon.save();

    return NextResponse.json({
      success: true,
      data: {
        id: coupon._id.toString(),
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        isValid: coupon.isValid,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
        singleUse: coupon.singleUse,
        usedBy: coupon.usedBy,
        applicableCourses: coupon.applicableCourses,
        minimumAmount: coupon.minimumAmount,
        expiresAt: coupon.expiresAt?.toISOString(),
        createdBy: coupon.createdBy.toString(),
        createdAt: coupon.createdAt.toISOString(),
        updatedAt: coupon.updatedAt.toISOString(),
      },
      message: "Coupon created successfully",
    });
  } catch (error) {
    console.error("Coupon creation error:", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
