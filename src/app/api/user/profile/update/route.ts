import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/utils/authOptions";
import connectDB from '@/lib/connectDB';
import User from '@/lib/models/User';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { phoneNumber, dateOfBirth } = body;

    if (
      (phoneNumber && typeof phoneNumber !== 'string') ||
      (dateOfBirth && typeof dateOfBirth !== 'string')
    ) {
      return NextResponse.json(
        { error: 'Invalid phone number or date of birth' },
        { status: 400 }
      );
    }

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        ...(phoneNumber && { phoneNumber }),
        ...(dateOfBirth && { dateOfBirth }),
      },
      { new: true, select: 'name email phoneNumber dateOfBirth' }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
