import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/utils/authOptions";
import connectDB from "@/lib/connectDB";
import User from "@/lib/models/User";
import Review from "@/lib/models/Review";
import Course from "@/lib/models/Course";

/**
 * POST /api/course/review/[slug]/helpful
 * Handle voting on reviews as helpful or not helpful
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { reviewId, helpful } = body;

    if (!reviewId || typeof helpful !== "boolean") {
      return NextResponse.json(
        { error: "Review ID and helpful flag are required" },
        { status: 400 }
      );
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const userId = user._id.toString();
    const hasVotedHelpful = review.helpfulVoters
      .map((id) => id.toString())
      .includes(userId);
    const hasVotedNotHelpful = review.notHelpfulVoters
      .map((id) => id.toString())
      .includes(userId);

    // If user already voted same option, do nothing
    if ((helpful && hasVotedHelpful) || (!helpful && hasVotedNotHelpful)) {
      return NextResponse.json({
        success: true,
        message: "Vote unchanged",
        data: {
          helpful: review.helpful,
          notHelpful: review.notHelpful,
        },
      });
    }

    // Remove opposite vote if it exists
    if (helpful && hasVotedNotHelpful) {
      review.notHelpful -= 1;
      review.notHelpfulVoters = review.notHelpfulVoters.filter(
        (id) => id.toString() !== userId
      );
    } else if (!helpful && hasVotedHelpful) {
      review.helpful -= 1;
      review.helpfulVoters = review.helpfulVoters.filter(
        (id) => id.toString() !== userId
      );
    }

    // Apply current vote
    if (helpful) {
      review.helpful += 1;
      review.helpfulVoters.push(user._id);
    } else {
      review.notHelpful += 1;
      review.notHelpfulVoters.push(user._id);
    }

    await review.save();

    const ratingStats = await Review.aggregate([
      { $match: { course: review.course } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (ratingStats.length > 0) {
      await Course.findByIdAndUpdate(review.course, {
        rating: Math.round(ratingStats[0].averageRating * 10) / 10,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Your vote has been updated.",
      data: {
        helpful: review.helpful,
        notHelpful: review.notHelpful,
      },
    });
  } catch (error) {
    console.error("Review voting error:", error);
    return NextResponse.json(
      { error: "Failed to process vote" },
      { status: 500 }
    );
  }
}
