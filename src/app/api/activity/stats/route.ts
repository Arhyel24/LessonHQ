import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/utils/authOptions";
import connectDB from '@/lib/connectDB';
import Activity from '@/lib/models/Activity';
import User from '@/lib/models/User';

/**
 * GET /api/activity/stats
 * Get activity statistics for the current user
 */
export async function GET() {
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

    // Get activity statistics
    const [
      totalActivities,
      unreadCount,
      categoryCounts,
      priorityCounts,
      recentActivities
    ] = await Promise.all([
      // Total activities
      Activity.countDocuments({ user: user._id }),
      
      // Unread count
      Activity.countDocuments({ user: user._id, read: false }),
      
      // Activities by category
      Activity.aggregate([
        { $match: { user: user._id } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      
      // Activities by priority
      Activity.aggregate([
        { $match: { user: user._id } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      
      // Recent activities (last 7 days)
      Activity.countDocuments({
        user: user._id,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);

    // Format category counts
    const categoryStats = categoryCounts.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Format priority counts
    const priorityStats = priorityCounts.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        total: totalActivities,
        unread: unreadCount,
        read: totalActivities - unreadCount,
        recent: recentActivities,
        categories: categoryStats,
        priorities: priorityStats,
        readPercentage: totalActivities > 0 ? Math.round(((totalActivities - unreadCount) / totalActivities) * 100) : 0
      }
    });

  } catch (error) {
    console.error('Activity stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity statistics' },
      { status: 500 }
    );
  }
}