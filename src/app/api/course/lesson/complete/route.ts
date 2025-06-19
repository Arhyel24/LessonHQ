import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import User from "@/lib/models/User";
import Course from "@/lib/models/Course";
import Progress from "@/lib/models/Progress";
import connectDB from "@/lib/connectDB";
import { authOptions } from "@/lib/utils/authOptions";

export async function POST(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEmail = session.user?.email;

  const { courseId, lessonId } = await req.json();
  console.log("Lesson ID:", lessonId);

  if (!courseId || !lessonId) {
    return NextResponse.json(
      { error: "Missing courseId or lessonId" },
      { status: 400 }
    );
  }

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Find or create progress record
    let progress = await Progress.findOne({ user: user._id, course: courseId });

    if (!progress) {
      progress = await Progress.create({
        user: user._id,
        course: courseId,
        lessonsCompleted: [lessonId],
        percentage: Math.floor((1 / course.lessons.length) * 100),
      });
    } else {
      if (!progress.lessonsCompleted.includes(lessonId)) {
        progress.lessonsCompleted.push(lessonId);
        progress.percentage = Math.floor(
          (progress.lessonsCompleted.length / course.lessons.length) * 100
        );
        await progress.save();
      }
    }

    return NextResponse.json({ message: "Lesson marked as completed" });
  } catch (err) {
    console.error("Error marking lesson complete:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
