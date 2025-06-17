import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/connectDB';
import Activity from '@/lib/models/Activity';
import User from '@/lib/models/User';

/**
 * POST /api/activity/mark-all-read
 * Mark all activities as read for the current user
 */
export async function POST() {
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

    // Mark all activities as read
    const result = await Activity.updateMany(
      { user: user._id, read: false },
      { read: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      },
      message: `Marked ${result.modifiedCount} activities as read`
    });

  } catch (error) {
    console.error('Mark all read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark activities as read' },
      { status: 500 }
    );
  }
}