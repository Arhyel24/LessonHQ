import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/connectDB';
import User from '@/lib/models/User';
import { sendEmail } from '@/lib/sendEmail';
import { createActivity } from '@/lib/utils/activityHelper';
import { hashPassword } from '@/lib/auth';

/**
 * POST /api/admin/users/enrol
 * Enroll a new user (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Check if user is admin
    const adminUser = await User.findOne({ email: session.user.email });
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, role = 'student', referralCode } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate random password
    const generatedPassword = generateRandomPassword();
    
    // Hash the password
    const hashedPassword = await hashPassword(generatedPassword);

    // Generate unique referral code
    const userReferralCode = await generateUniqueReferralCode();

    // Validate referral code if provided
    let referredBy = "";
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (!referrer) {
        return NextResponse.json(
          { error: 'Invalid referral code' },
          { status: 400 }
        );
      }
      referredBy = referrer.referralCode;
    }

    // Create new user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      referralCode: userReferralCode,
      referredBy,
      referralEarnings: 0
    });

    await newUser.save();

    // Send welcome email with credentials
    try {
      await sendWelcomeEmail(email, name, generatedPassword);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the user creation if email fails
    }

    // Create activity for the new user
    await createActivity({
      userId: newUser._id.toString(),
      type: 'profile_updated',
      title: 'Welcome to MIC Platform!',
      message: 'Your account has been created by an administrator. Check your email for login credentials.',
      category: 'system',
      priority: 'high'
    });

    // Create activity for admin
    await createActivity({
      userId: adminUser._id.toString(),
      type: 'system_announcement',
      title: 'User Enrolled',
      message: `You successfully enrolled ${name} (${email}) as a ${role}.`,
      category: 'system',
      priority: 'medium',
      data: {
        enrolledUser: {
          id: newUser._id,
          name,
          email,
          role
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        referralCode: newUser.referralCode,
        coursesEnrolled: 0,
        referralEarnings: 0,
        joinedAt: newUser.createdAt.toISOString().split('T')[0],
        status: 'active'
      },
      message: 'User enrolled successfully. Welcome email sent with login credentials.'
    });

  } catch (error) {
    console.error('User enrollment error:', error);
    return NextResponse.json(
      { error: 'Failed to enroll user' },
      { status: 500 }
    );
  }
}

// Helper function to generate random password
function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one of each type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special char
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Helper function to generate unique referral code
async function generateUniqueReferralCode(): Promise<string> {
  let code = "";
  let isUnique = false;
  
  while (!isUnique) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const existingUser = await User.findOne({ referralCode: code });
    if (!existingUser) {
      isUnique = true;
    }
  }
  
  return code;
}

// Helper function to send welcome email
async function sendWelcomeEmail(email: string, name: string, password: string): Promise<void> {
  const subject = 'Welcome to MIC Platform - Your Account Details';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to MIC Platform!</h2>
      
      <p>Hello ${name},</p>
      
      <p>Your account has been created by our administrator. Here are your login credentials:</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>
      
      <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
      
      <p>You can log in to your account at: <a href="${process.env.NEXTAUTH_URL}/auth/signin">${process.env.NEXTAUTH_URL}/auth/signin</a></p>
      
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      
      <p>Best regards,<br>The MIC Platform Team</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject,
    html
  });
}