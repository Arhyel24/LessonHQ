import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";
import Course, { ICourse } from "@/lib/models/Course";
import Purchase from "@/lib/models/Purchase";
import Progress, { IProgress } from "@/lib/models/Progress";

interface LessonWithId {
  _id: string;
  title: string;
  videoUrl: string;
  textContent: string;
  duration?: string;
  order?: number;
}

interface LessonItem {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
}

interface CurrentLesson {
  id: string;
  title: string;
  videoUrl: string;
  duration?: string;
  order?: number;
  isCompleted: boolean;
  notes: string;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await context.params;
    const lessonIdParam = req.nextUrl.searchParams.get("lessonId");

    await connectDB();

    // Run all queries in parallel where possible
    const [user, course] = await Promise.all([
      User.findOne({ email: session.user.email }).select("_id").lean(),
      Course.findOne({ slug, status: "published" })
        .select("title lessons")
        .lean<ICourse>(),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const [purchase, progress] = await Promise.all([
      Purchase.findOne({
        user: user._id,
        course: course._id,
        status: "completed",
      })
        .select("_id")
        .lean(),
      Progress.findOne({ user: user._id, course: course._id })
        .select("lessonsCompleted lastAccessedAt")
        .lean<IProgress>(),
    ]);

    if (!purchase) {
      return NextResponse.json(
        { error: "Course not purchased" },
        { status: 403 }
      );
    }

    const completedSet = new Set(
      (progress?.lessonsCompleted ?? []).map((id) => id.toString())
    );

    const sortedLessons = (course.lessons as LessonWithId[])
      .map((lesson, index) => ({ ...lesson, order: lesson.order ?? index }))
      .sort((a, b) => a.order! - b.order!);

    let firstIncompleteFound = false;
    const lessonItems: LessonItem[] = sortedLessons.map((lesson) => {
      const id = lesson._id.toString();
      const isCompleted = completedSet.has(id);
      const isLocked = !isCompleted && firstIncompleteFound;
      if (!isCompleted && !firstIncompleteFound) firstIncompleteFound = true;

      return {
        id,
        title: lesson.title,
        duration: lesson.duration ? `${lesson.duration}:00` : "0:00",
        isCompleted,
        isLocked,
      };
    });

    let currentLesson: CurrentLesson | null = null;
    const lessonMap = new Map(sortedLessons.map((l) => [l._id.toString(), l]));

    if (lessonIdParam && lessonMap.has(lessonIdParam)) {
      const index = sortedLessons.findIndex(
        (l) => l._id.toString() === lessonIdParam
      );
      const status = lessonItems[index];
      if (status && !status.isLocked) {
        const lesson = sortedLessons[index];
        currentLesson = {
          id: lesson._id.toString(),
          title: lesson.title,
          videoUrl: lesson.videoUrl,
          duration: lesson.duration ? `${lesson.duration}:00` : "0:00",
          order: lesson.order,
          isCompleted: status.isCompleted,
          notes: lesson.textContent,
        };
      }
    }

    if (!currentLesson) {
      const lastUnlockedIndex = [...lessonItems]
        .reverse()
        .findIndex((l) => !l.isLocked);
      if (lastUnlockedIndex !== -1) {
        const actualIndex = lessonItems.length - 1 - lastUnlockedIndex;
        const lesson = sortedLessons[actualIndex];
        currentLesson = {
          id: lesson._id.toString(),
          title: lesson.title,
          videoUrl: lesson.videoUrl,
          duration: lesson.duration ? `${lesson.duration}:00` : "0:00",
          order: lesson.order,
          isCompleted: lessonItems[actualIndex].isCompleted,
          notes: lesson.textContent,
        };
      }
    }

    const totalLessons = sortedLessons.length;
    const completedLessons = lessonItems.filter((l) => l.isCompleted).length;
    const percentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    // Avoid extra fetch/save if not needed
    await Progress.findOneAndUpdate(
      { user: user._id, course: course._id },
      {
        $set: {
          lastAccessedAt: new Date(),
        },
        $setOnInsert: {
          lessonsCompleted: [],
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
      currentLesson,
      lessons: lessonItems,
    });
  } catch (error) {
    console.error("[COURSE_LEARNING_API_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
