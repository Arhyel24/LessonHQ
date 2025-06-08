import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { sendSupportEmail } from "@/lib/sendEmail";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const { name, email, subject, message } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Add user context if logged in
    let enrichedMessage = message;
    if (session) {
      enrichedMessage = `
User Details:
- Name: ${session.user.name}
- Email: ${session.user.email}
- User ID: ${session.user.id}
- Role: ${session.user.role}

Message:
${message}
      `.trim();
    }

    // Send support email
    await sendSupportEmail({
      name,
      email,
      subject,
      message: enrichedMessage,
    });

    return NextResponse.json({
      success: true,
      message:
        "Support request sent successfully. We will get back to you soon.",
    });
  } catch (error) {
    console.error("Error sending support email:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send support request. Please try again later.",
      },
      { status: 500 }
    );
  }
}
