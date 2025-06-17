import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";

/**
 * GET /api/user/notification-preferences
 * Get user's notification preferences
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email }).select(
      "notificationPreferences"
    );
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user.notificationPreferences || {
        email: {
          courseUpdates: true,
          promotions: true,
          referralEarnings: true,
          supportReplies: true,
          systemAnnouncements: true,
        },
        push: {
          courseUpdates: true,
          promotions: false,
          referralEarnings: true,
          supportReplies: true,
          systemAnnouncements: true,
        },
      },
    });
  } catch (error) {
    console.error("Notification preferences fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification preferences" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/notification-preferences
 * Update user's notification preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { preferences } = body;

    // Validate preferences structure
    if (!preferences || typeof preferences !== "object") {
      return NextResponse.json(
        { error: "Invalid preferences format" },
        { status: 400 }
      );
    }

    // Update user preferences
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { notificationPreferences: preferences },
      { new: true, select: "notificationPreferences" }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user.notificationPreferences,
      message: "Notification preferences updated successfully",
    });
  } catch (error) {
    console.error("Notification preferences update error:", error);
    return NextResponse.json(
      { error: "Failed to update notification preferences" },
      { status: 500 }
    );
  }
}
