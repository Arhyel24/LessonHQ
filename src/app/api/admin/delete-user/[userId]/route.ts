import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";
import Purchase from "@/lib/models/Purchase";
import Progress from "@/lib/models/Progress";
import Activity from "@/lib/models/Activity";

/**
 * DELETE /api/admin/delete-user/[userId]
 * Delete user account (admin only)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {userId} = await context.params;

    await connectDB();

    // Check if user is admin
    const adminUser = await User.findOne({ email: session.user.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reason, forceDelete = false } = body;

    // Get target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent admin from deleting themselves
    if (targetUser._id.toString() === adminUser._id.toString()) {
      return NextResponse.json(
        { error: "Cannot delete your own admin account" },
        { status: 400 }
      );
    }

    // Prevent deleting other admins unless force delete
    if (targetUser.role === "admin" && !forceDelete) {
      return NextResponse.json(
        { error: "Cannot delete admin accounts without force flag" },
        { status: 400 }
      );
    }

    // Check for active data
    const [purchases, referralEarnings] = await Promise.all([
      Purchase.find({ user: userId, status: "completed" }),
      targetUser.referralEarnings,
    ]);

    if ((purchases.length > 0 || referralEarnings > 0) && !forceDelete) {
      return NextResponse.json(
        {
          error:
            "User has active purchases or referral earnings. Use forceDelete=true to override.",
          code: "ACTIVE_DATA_EXISTS",
          data: {
            purchases: purchases.length,
            referralEarnings,
          },
        },
        { status: 400 }
      );
    }

    // Delete related data
    await Promise.all([
      Progress.deleteMany({ user: userId }),
      Activity.deleteMany({ user: userId }),
      Purchase.deleteMany({ user: userId }),
    ]);

    // Delete user account
    await User.findByIdAndDelete(userId);

    // Log admin deletion
    console.log(
      `Admin deletion - Target: ${targetUser.email}, Admin: ${
        adminUser.email
      }, Reason: ${reason || "Not specified"}`
    );

    // Create activity for admin
    await Activity.create({
      user: adminUser._id,
      type: "system_announcement",
      title: "User Account Deleted",
      message: `You deleted user account: ${targetUser.email}`,
      category: "system",
      priority: "medium",
      data: {
        deletedUser: {
          id: targetUser._id,
          email: targetUser.email,
          name: targetUser.name,
        },
        reason,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User account deleted successfully",
      data: {
        deletedUser: {
          id: targetUser._id,
          email: targetUser.email,
          name: targetUser.name,
        },
      },
    });
  } catch (error) {
    console.error("Admin user deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete user account" },
      { status: 500 }
    );
  }
}
