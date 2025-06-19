import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/utils/authOptions";
import connectDB from '@/lib/connectDB';
import User from '@/lib/models/User';
import Purchase from '@/lib/models/Purchase';
import Progress from '@/lib/models/Progress';
import Activity from '@/lib/models/Activity';

/**
 * DELETE /api/user/delete-account
 * Delete user account (self-deletion)
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // const body = await request.json();
    // const { reason } = body;

    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for active purchases or referral earnings
    const purchases = await Purchase.find({ user: user._id, status: 'completed' });
    if (purchases.length > 0 && user.referralEarnings > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete account with active purchases and referral earnings. Please contact support.',
          code: 'ACTIVE_DATA_EXISTS'
        },
        { status: 400 }
      );
    }

    // Delete related data
    await Promise.all([
      Progress.deleteMany({ user: user._id }),
      Activity.deleteMany({ user: user._id }),
      Purchase.deleteMany({ user: user._id, status: 'pending' }) // Only delete pending purchases
    ]);

    // Delete user account
    await User.findByIdAndDelete(user._id);

    // // Log deletion reason (optional - for analytics)
    // if (reason) {
    //   console.log(`Account deleted - User: ${user.email}, Reason: ${reason}`);
    // }

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}