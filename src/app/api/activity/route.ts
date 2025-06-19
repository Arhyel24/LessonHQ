import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/utils/authOptions";
import connectDB from '@/lib/connectDB';
import Activity from '@/lib/models/Activity';
import User from '@/lib/models/User';

/**
 * GET /api/activity
 * Get user's activity feed with pagination and filters
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const read = searchParams.get('read');
    const priority = searchParams.get('priority');

    // Build filter query
    const filter: any = { user: user._id };
    
    if (category) filter.category = category;
    if (read !== null) filter.read = read === 'true';
    if (priority) filter.priority = priority;

    // Get activities with pagination
    const skip = (page - 1) * limit;
    const activities = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Activity.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    // Get unread count
    const unreadCount = await Activity.countDocuments({
      user: user._id,
      read: false
    });

    return NextResponse.json({
      success: true,
      data: {
        activities,
        pagination: {
          page,
          limit,
          total,
          pages,
          hasNext: page < pages,
          hasPrev: page > 1
        },
        unreadCount
      }
    });

  } catch (error) {
    console.error('Activity fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/activity
 * Create a new activity/notification (admin only or system)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get user and check if admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      targetUserId,
      type,
      title,
      message,
      data,
      priority = 'medium',
      category,
      actionUrl,
      expiresAt
    } = body;

    // Validate required fields
    if (!targetUserId || !type || !title || !message || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create activity
    const activity = new Activity({
      user: targetUserId,
      type,
      title,
      message,
      data,
      priority,
      category,
      actionUrl,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    await activity.save();

    return NextResponse.json({
      success: true,
      data: activity,
      message: 'Activity created successfully'
    });

  } catch (error) {
    console.error('Activity creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}