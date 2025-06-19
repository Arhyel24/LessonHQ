import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/utils/authOptions";

import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";
import Purchase from "@/lib/models/Purchase";

import { AffiliateStatus } from "@/types/earnings";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .select("referralCode referralEarnings referralBalance")
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const referredUsers = await User.find({ referredBy: user.referralCode })
      .select("name email createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const referredUserIds = referredUsers.map((u) => u._id);

    const referralPurchases = await Purchase.find({
      user: { $in: referredUserIds },
    })
      .populate({ path: "user", select: "name email" })
      .populate({ path: "course", select: "title" })
      .sort({ paidAt: -1 })
      .lean();

    // Calculate earnings breakdown
    const earningsBreakdown = referralPurchases.map((purchase) => ({
      id: (purchase._id as string).toString(),
      user: purchase.user,
      course: purchase.course,
      amount: purchase.amount,
      commission: purchase.amount * 0.3,
      paidAt: new Date(purchase.paidAt),
      status: purchase.status,
    }));

    // Monthly earnings
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const earningsThisMonth = earningsBreakdown
      .filter((e) => e.paidAt >= startOfMonth && e.paidAt <= endOfMonth)
      .reduce((sum, e) => sum + e.commission, 0);

    // History per referred user
    const history = referredUsers.map((refUser) => {
      const purchase = referralPurchases.find(
        (p) => p.user._id.toString() === refUser._id.toString()
      );

      let status: AffiliateStatus = "Registered";
      let reward = 0;

      if (purchase) {
        if (purchase.status === "completed") {
          status = "Completed";
        } else {
          status = "Course Started";
        }
        reward = purchase.amount * 0.3;
      } else {
        const daysSinceReferral =
          (Date.now() - new Date(refUser.createdAt).getTime()) /
          (1000 * 60 * 60 * 24);
        if (daysSinceReferral > 7) {
          status = "Pending";
        }
      }

      return {
        id: refUser._id.toString(),
        name: refUser.name,
        dateReferred: new Date(refUser.createdAt).toISOString().split("T")[0],
        status,
        reward: Math.floor(reward),
      };
    });

    const successfulAffiliates = history.filter(
      (h) => h.status === "Completed"
    ).length;
    const pendingAffiliates = history.filter(
      (h) => h.status === "Pending"
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        totalEarnings: user.referralEarnings,
        withdrawableBalance: user.referralEarnings,
        earningsThisMonth: Math.floor(earningsThisMonth),
        successfulAffiliates,
        pendingAffiliates,
        AffiliateLink: `https://mic.dev.app/auth/signup?ref=${user.referralCode}`,
        history,
      },
    });
  } catch (error) {
    console.error("[REFERRAL_FETCH_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch referral data" },
      { status: 500 }
    );
  }
}
