import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";
import Purchase from "@/lib/models/Purchase";
import { AffiliateStatus } from "@/types/earnings";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).select(
      "referralCode referralEarnings referralBalance"
    );
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const referredUsers = await User.find({ referredBy: user.referralCode })
      .select("name email createdAt")
      .sort({ createdAt: -1 });

    const referredUserIds = referredUsers.map((u) => u._id);

    const referralPurchases = await Purchase.find({
      user: { $in: referredUserIds },
    })
      .populate("user", "name email")
      .populate("course", "title")
      .sort({ paidAt: -1 });

    const earningsBreakdown = referralPurchases.map((purchase) => ({
      id: purchase._id,
      user: purchase.user,
      course: purchase.course,
      amount: purchase.amount,
      commission: purchase.amount * 0.3,
      paidAt: purchase.paidAt,
    }));

    // Calculate current month earnings
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyEarnings = earningsBreakdown
      .filter(
        (purchase) =>
          purchase.paidAt >= firstDayOfMonth &&
          purchase.paidAt <= lastDayOfMonth
      )
      .reduce((sum, purchase) => sum + purchase.commission, 0);

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
        const daysAgo =
          (Date.now() - new Date(refUser.createdAt).getTime()) /
          (1000 * 60 * 60 * 24);
        if (daysAgo > 7) status = "Pending";
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
        successfulAffiliates,
        pendingAffiliates,
        withdrawableBalance: user.referralBalance || user.referralEarnings,
        AffiliateLink: `https://mic.dev.app/auth/signup?ref=${user.referralCode}`,
        earningsThisMonth: Math.floor(monthlyEarnings),
        history,
      },
    });
  } catch (error) {
    console.error("Error fetching referral data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch referral data" },
      { status: 500 }
    );
  }
}
