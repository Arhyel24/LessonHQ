import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/utils/authOptions";
import connectDB from '@/lib/connectDB';
import Coupon from '@/lib/models/Coupon';
import User from '@/lib/models/User';

/**
 * POST /api/admin/coupons/apply
 * Apply coupon and mark as used (called during payment)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    // Find and update coupon
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    // Update usage count and add user to usedBy array
    coupon.usedCount += 1;
    if (!coupon.usedBy.includes(user._id)) {
      coupon.usedBy.push(user._id);
    }

    // If it's a single-use coupon and reached limit, mark as invalid
    if (coupon.singleUse || (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)) {
      coupon.isValid = false;
      coupon.message = 'This coupon has been used';
    }

    await coupon.save();

    return NextResponse.json({
      success: true,
      message: 'Coupon applied successfully'
    });

  } catch (error) {
    console.error('Coupon application error:', error);
    return NextResponse.json(
      { error: 'Failed to apply coupon' },
      { status: 500 }
    );
  }
}