import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";
import Course from "@/lib/models/Course";
import Purchase from "@/lib/models/Purchase";
import Progress from "@/lib/models/Progress";
import { sendEmail } from "@/lib/sendEmail";

/**
 * POST /api/admin/analytics/export
 * Export analytics data as Excel and email to admin
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Check if user is admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Gather analytics data
    const [
      totalUsers,
      totalCourses,
      totalPurchases,
      totalRevenue,
      completedCourses,
      recentUsers,
      topCourses,
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments({ status: "published" }),
      Purchase.countDocuments({ status: "completed" }),
      Purchase.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Progress.countDocuments({ percentage: 100 }),
      User.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("name email createdAt"),
      Purchase.aggregate([
        { $match: { status: "completed" } },
        {
          $lookup: {
            from: "courses",
            localField: "course",
            foreignField: "_id",
            as: "courseInfo",
          },
        },
        { $unwind: "$courseInfo" },
        {
          $group: {
            _id: "$course",
            title: { $first: "$courseInfo.title" },
            enrollments: { $sum: 1 },
            revenue: { $sum: "$amount" },
          },
        },
        { $sort: { enrollments: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    // Create CSV content
    const csvContent = `
Analytics Report - ${new Date().toLocaleDateString()}

SUMMARY STATISTICS
Total Users,${totalUsers}
Total Courses,${totalCourses}
Total Purchases,${totalPurchases}
Total Revenue,$${revenue}
Completed Courses,${completedCourses}
Completion Rate,${
      totalPurchases > 0
        ? Math.round((completedCourses / totalPurchases) * 100)
        : 0
    }%

RECENT USERS
Name,Email,Joined Date
${recentUsers
  .map((u) => `${u.name},${u.email},${u.createdAt.toLocaleDateString()}`)
  .join("\n")}

TOP COURSES
Course Title,Enrollments,Revenue
${topCourses.map((c) => `${c.title},${c.enrollments},$${c.revenue}`).join("\n")}
    `.trim();

    // Send email with CSV attachment
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Analytics Report</h2>
        
        <p>Hello ${user.name},</p>
        
        <p>Your requested analytics report is attached to this email.</p>
        
        <h3>Summary:</h3>
        <ul>
          <li><strong>Total Users:</strong> ${totalUsers}</li>
          <li><strong>Total Courses:</strong> ${totalCourses}</li>
          <li><strong>Total Revenue:</strong> $${revenue}</li>
          <li><strong>Completion Rate:</strong> ${
            totalPurchases > 0
              ? Math.round((completedCourses / totalPurchases) * 100)
              : 0
          }%</li>
        </ul>
        
        <p>Report generated on: ${new Date().toLocaleString()}</p>
        
        <p>Best regards,<br>LearnHQ Analytics System</p>
      </div>
    `;

    // Note: In a real implementation, you would use a proper email service
    // that supports attachments. For now, we'll send the CSV content in the email body.
    const emailWithData =
      emailHtml +
      `
      <hr>
      <h3>CSV Data:</h3>
      <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto;">
${csvContent}
      </pre>
    `;

    await sendEmail({
      to: user.email,
      subject: `Analytics Report - ${new Date().toLocaleDateString()}`,
      html: emailWithData,
    });

    return NextResponse.json({
      success: true,
      message: `Analytics report has been sent to ${user.email}`,
    });
  } catch (error) {
    console.error("Analytics export error:", error);
    return NextResponse.json(
      { error: "Failed to export analytics data" },
      { status: 500 }
    );
  }
}
