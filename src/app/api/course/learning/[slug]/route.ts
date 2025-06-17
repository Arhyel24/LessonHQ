import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";
import Course, { ICourse } from "@/lib/models/Course";
import Purchase from "@/lib/models/Purchase";
import Progress, { IProgress } from "@/lib/models/Progress";

type LessonWithId = {
  _id: string;
  title: string;
  videoUrl: string;
  textContent: string;
  duration?: string;
  order?: number;
};

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const lessonIdParam = req.nextUrl.searchParams.get("lessonId");

    await connectDB();

    const user = await User.findOne({ email: session.user.email }).select(
      "_id"
    );
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const course = await Course.findOne({ slug, status: "published" })
      .select("title lessons")
      .lean<ICourse>();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const purchase = await Purchase.findOne({
      user: user._id,
      course: course._id,
      status: "completed",
    }).select("_id");

    if (!purchase) {
      return NextResponse.json(
        { error: "Course not purchased" },
        { status: 403 }
      );
    }

    const progress = await Progress.findOne({
      user: user._id,
      course: course._id,
    }).lean<IProgress>();

    const completedSet = new Set(
      (progress?.lessonsCompleted ?? []).map((id) => id.toString())
    );

    // Sort lessons by order or index
    const sortedLessons = (course.lessons as LessonWithId[])
      .map((lesson, index) => ({
        ...lesson,
        order: lesson.order ?? index,
      }))
      .sort((a, b) => a.order - b.order);

    let firstIncompleteFound = false;
    const lessonItems = sortedLessons.map((lesson) => {
      const idStr = lesson._id.toString();
      const isCompleted = completedSet.has(idStr);
      const isLocked = !isCompleted && firstIncompleteFound;
      if (!isCompleted && !firstIncompleteFound) firstIncompleteFound = true;

      return {
        id: idStr,
        title: lesson.title,
        duration: lesson.duration ? `${lesson.duration}:00` : "0:00",
        isCompleted,
        isLocked,
      };
    });

    // Select currentLesson
    let currentLessonObj: {
      id: string;
      title: string;
      videoUrl: string;
      duration?: string;
      order?: number;
      isCompleted: boolean;
      notes: string;
    } | null = null;

    const lessonMap = new Map(
      sortedLessons.map((lesson) => [lesson._id.toString(), lesson])
    );

    if (lessonIdParam && lessonMap.has(lessonIdParam)) {
      const index = sortedLessons.findIndex(
        (l) => l._id.toString() === lessonIdParam
      );
      const status = lessonItems[index];

      if (status && !status.isLocked) {
        currentLessonObj = {
          id: sortedLessons[index]._id.toString(),
          title: sortedLessons[index].title,
          videoUrl: sortedLessons[index].videoUrl,
          duration: sortedLessons[index].duration
            ? `${sortedLessons[index].duration}:00`
            : "0:00",
          isCompleted: status.isCompleted,
          notes: sortedLessons[index].textContent,
        };
      }
    }

    // Fallback to first unlocked lesson
    if (!currentLessonObj) {
      const lastUnlockedIndex = [...lessonItems]
        .reverse()
        .findIndex((l) => !l.isLocked);

      if (lastUnlockedIndex !== -1) {
        const actualIndex = lessonItems.length - 1 - lastUnlockedIndex;
        const lesson = sortedLessons[actualIndex];

        currentLessonObj = {
          id: lesson._id.toString(),
          title: lesson.title,
          videoUrl: lesson.videoUrl,
          duration: lesson.duration ? `${lesson.duration}:00` : "0:00",
          isCompleted: lessonItems[actualIndex].isCompleted,
          notes: lesson.textContent,
        };
      }
    }

    const totalLessons = sortedLessons.length;
    const completedLessons = lessonItems.filter((l) => l.isCompleted).length;
    const percentage = totalLessons
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    await Progress.findOneAndUpdate(
      { user: user._id, course: course._id },
      {
        $set: {
          lastAccessedAt: new Date(),
        },
        $setOnInsert: {
          lessonsCompleted: currentLessonObj ? [currentLessonObj.id] : [],
          percentage: Math.floor((0 / course.lessons.length) * 100),
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      course: {
        id: (course._id as string).toString(),
        title: course.title,
        progress: percentage,
        totalLessons,
        completedLessons,
      },
      currentLesson: currentLessonObj,
      lessons: lessonItems,
    });
  } catch (error) {
    console.error("Course learning fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
