import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";
import Course from "@/lib/models/Course";
import Review from "@/lib/models/Review";
import Purchase from "@/lib/models/Purchase";
import { createActivity } from "@/lib/utils/activityHelper";

/**
 * GET /api/courses/[slug]/review
 * Get reviews for a specific course
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "newest";
    const userId = searchParams.get("userId");

    // Sort logic
    let sortQuery: any = { createdAt: -1 }; // default: newest
    if (sort === "oldest") sortQuery = { createdAt: 1 };
    if (sort === "highest") sortQuery = { rating: -1, createdAt: -1 };
    if (sort === "lowest") sortQuery = { rating: 1, createdAt: -1 };

    const skip = (page - 1) * limit;

    const { slug } = await context.params;

    const course = await Course.findOne({
      slug,
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Fetch approved reviews
    const reviews = await Review.find({
      course: course.id,
      status: "approved",
    })
      .populate("user", "name avatar")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    // Fetch total count and stats
    const [totalReviews, ratingStats] = await Promise.all([
      Review.countDocuments({ course: course.id, status: "approved" }),
      Review.aggregate([
        { $match: { course: course.id, status: "approved" } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
            ratingDistribution: { $push: "$rating" },
          },
        },
      ]),
    ]);

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (ratingStats.length > 0) {
      ratingStats[0].ratingDistribution.forEach((rating: number) => {
        ratingDistribution[rating as keyof typeof ratingDistribution]++;
      });
    }

    const averageRating =
      ratingStats.length > 0 ? ratingStats[0].averageRating : 0;
    const pages = Math.ceil(totalReviews / limit);

    const transformedReviews = reviews.map((review) => {
      const votedHelpful = review.helpfulVoters
        ?.map((id: any) => id.toString())
        .includes(user._id.toString());
      const votedNotHelpful = review.notHelpfulVoters
        ?.map((id: any) => id.toString())
        .includes(user._id.toString());

      let voted: boolean | undefined = undefined;
      if (votedHelpful) voted = true;
      else if (votedNotHelpful) voted = false;

      return {
        id: (review._id as string).toString(),
        user: {
          name: review.user?.name || "Anonymous",
          avatar: review.user?.avatar,
        },
        rating: review.rating,
        comment: review.comment,
        isVerifiedPurchase: review.isVerifiedPurchase,
        helpful: review.helpful,
        notHelpful: review.notHelpful,
        voted,
        createdAt: review.createdAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };
    });

    interface ExistingReview {
      rating: number;
      comment: string;
    }

    // 🟢 Get existing user review if userId is passed
    let existingReview: ExistingReview | null = null;
    if (userId) {
      const found = await Review.findOne({
        course: course.id,
        user: userId,
      }).lean<ExistingReview>();

      if (found) {
        existingReview = {
          rating: found.rating,
          comment: found.comment,
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        reviews: transformedReviews,
        existingReview,
        pagination: {
          page,
          limit,
          total: totalReviews,
          pages,
          hasNext: page < pages,
          hasPrev: page > 1,
        },
        statistics: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews,
          ratingDistribution,
        },
      },
    });
  } catch (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/[slug]/review
 * Submit a review for a course
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { slug } = await context.params;

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const course = await Course.findOne({ slug });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (comment && comment.length > 1000) {
      return NextResponse.json(
        { error: "Comment must be less than 1000 characters" },
        { status: 400 }
      );
    }

    const existingReview = await Review.findOne({
      user: user._id,
      course: course.id,
    });

    const purchase = await Purchase.findOne({
      user: user._id,
      course: course.id,
      status: "completed",
    });

    const isVerifiedPurchase = !!purchase;

    let review;

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment?.trim();
      existingReview.isVerifiedPurchase = isVerifiedPurchase;
      existingReview.updatedAt = new Date();
      await existingReview.save();
      review = existingReview;
    } else {
      // Create new review
      review = new Review({
        user: user._id,
        course: course.id,
        rating,
        comment: comment?.trim(),
        isVerifiedPurchase,
      });
      await review.save();
    }

    // Update course average rating
    const ratingStats = await Review.aggregate([
      { $match: { course: course.id } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (ratingStats.length > 0) {
      await Course.findByIdAndUpdate(course.id, {
        rating: Math.round(ratingStats[0].averageRating * 10) / 10,
      });
    }

    // Create activity (optional for updates)
    await createActivity({
      userId: user._id.toString(),
      type: "course_reviewed",
      title: existingReview ? "Review Updated" : "Course Review Submitted",
      message: `You ${
        existingReview ? "updated" : "submitted"
      } a ${rating}-star review for "${course.title}".`,
      data: { courseId: course.id, courseTitle: course.title, rating },
      priority: "low",
      category: "course",
      actionUrl: `/courses/${course.id}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: review._id.toString(),
        rating: review.rating,
        comment: review.comment,
        isVerifiedPurchase: review.isVerifiedPurchase,
        createdAt: review.createdAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
      message: existingReview
        ? "Review updated successfully"
        : "Review submitted successfully",
    });
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
