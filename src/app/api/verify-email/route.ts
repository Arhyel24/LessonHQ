import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";
import { createActivity } from "@/lib/utils/activityHelper";
import { sendEmailVerifiedMessage } from "@/lib/sendEmail";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.EMAIL_VERIFICATION_SECRET!
    ) as { email: string };

    await connectDB();
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email already verified" },
        { status: 200 }
      );
    }

    user.emailVerified = new Date();
    await user.save();

    await createActivity({
      userId: user._id.toString(),
      type: "email_verified",
      title: "Email Verified",
      message: "Your email address was successfully verified.",
      data: { email: user.email },
      priority: "low",
      category: "profile",
    });

    await sendEmailVerifiedMessage(user.email, user.name);

    return NextResponse.json(
      { success: true, message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    if ((error as Error).name === "TokenExpiredError") {
      return NextResponse.json(
        { error: "Verification link has expired. Please request a new one." },
        { status: 401 }
      );
    }

    console.error("Email verification failed:", error);
    return NextResponse.json(
      { error: "Invalid or malformed token" },
      { status: 400 }
    );
  }
}
