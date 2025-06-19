import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/connectDB";
import Coupon from "@/lib/models/Coupon";
import User from "@/lib/models/User";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/admin/coupons/status/:id
 * Toggle coupon status (enable/disable)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();

  // Check if user is admin
  const user = await User.findOne({ email: session.user.email });
  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  try {
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    coupon.isValid = !coupon.isValid;
    await coupon.save();

    return NextResponse.json({ success: true, coupon });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
