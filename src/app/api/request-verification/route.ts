import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";
import { sendVerificationEmail } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email already verified" },
        { status: 200 }
      );
    }

    const result = await sendVerificationEmail(user.email, user.name);

    console.log("Verification email sent:", result);

    return NextResponse.json(
      { success: true, message: "Verification email sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending verification email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
