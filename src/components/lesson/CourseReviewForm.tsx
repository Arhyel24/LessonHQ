"use client";

import { useCallback, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ReviewCard from "./ReviewCard";

interface CourseReviewFormProps {
  courseTitle: string;
}

export const CourseReviewForm = ({ courseTitle }: CourseReviewFormProps) => {
  const { slug } = useParams();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [localVotes, setLocalVotes] = useState<
    Record<string, boolean | undefined>
  >({});
  const [distribution, setDistribution] = useState<Record<number, number>>({});
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<
    number | null
  >(null);
  const [sort, setSort] = useState("newest");

  const { toast } = useToast();

  const fetchReviews = useCallback(
    async () => {
      try {
        const url = `/api/course/review/${slug}?page=${page}&userId=${
          userId ?? ""
        }&sort=${sort}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch reviews.");
        const data = await res.json();

        if (page > 1) {
          setReviews((prev) => [...prev, ...data.data.reviews]);
        } else {
          setReviews(data.data.reviews || []);
        }

        setDistribution(data.data.distribution || {});
        if (page === 1 && data.data.existingReview) {
          setComment(data.data.existingReview.comment);
          setRating(data.data.existingReview.rating);
        }

        setHasMore(data.data.pagination.hasNext);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    },
    [userId, sort, page, slug]
  );

  useEffect(() => {
    if (userId) fetchReviews();
  }, [fetchReviews, userId]);

  const handleVote = async (
    reviewId: string,
    helpful: boolean,
    currentVote: boolean
  ) => {
    if (currentVote === helpful) {
      setLocalVotes((prev) => ({ ...prev, [reviewId]: undefined }));
      return;
    }

    try {
      const res = await fetch(`/api/course/review/${slug}/helpful`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, helpful }),
      });

      const data = await res.json();

      if (res.ok) {
        setLocalVotes((prev) => ({ ...prev, [reviewId]: helpful }));
      } else {
        console.error(data.error || "Vote failed");
      }
    } catch (err) {
      console.error("Vote error:", err);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting your review.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/course/review/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment, rating }),
      });

      if (!res.ok) throw new Error("Failed to submit review.");

      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback. Your review has been saved.",
      });

      fetchReviews();
    } catch (error) {
      toast({
        title: (error as Error).message ?? "Failed to submit review",
        description: "Some error occurred, please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReviews = selectedRatingFilter
    ? reviews.filter((r) => r.rating === selectedRatingFilter)
    : reviews;

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const totalReviews = Object.values(distribution).reduce(
    (sum, val) => sum + val,
    0
  );

  return (
    <div className="space-y-6">
      {/* Review Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {rating > 0 ? "Update Your Review" : "Review This Course"}
          </CardTitle>
          <p className="text-gray-600">
            {`Share your experience with "${courseTitle}"`}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-3 block">
              Your Rating
            </Label>
            <div className="flex flex-wrap items-center gap-2 sm:gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-6 w-6 sm:h-8 sm:w-8 transition-colors",
                      hoveredRating >= star || rating >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-300"
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="w-full sm:w-auto text-sm text-gray-600 sm:ml-3 mt-2 sm:mt-0">
                  {rating} {rating === 1 ? "star" : "stars"}
                </span>
              )}
            </div>
          </div>

          <div>
            <Label
              htmlFor="review-comment"
              className="text-base font-medium mb-3 block"
            >
              Your Review (Optional)
            </Label>
            <Textarea
              id="review-comment"
              placeholder="Tell others about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {comment.length}/500 characters
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting || rating === 0}
              className="min-w-[120px] cursor-pointer"
            >
              {isSubmitting
                ? "Submitting..."
                : rating > 0
                ? "Update Review"
                : "Submit Review"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Review Filters */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {["All", 5, 4, 3, 2, 1].map((value) => (
            <Button
              key={value}
              variant={
                selectedRatingFilter ===
                (typeof value === "number" ? value : null)
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                setSelectedRatingFilter(
                  typeof value === "number" ? value : null
                )
              }
              className="text-sm px-3 py-1"
            >
              {typeof value === "number" ? `${value} Stars` : "All"}
            </Button>
          ))}
        </div>

        <select
          className="border px-3 py-2 rounded text-sm"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
      </div>

      {/* Rating Distribution */}
      {totalReviews > 0 && (
        <div className="space-y-1">
          {[5, 4, 3, 2, 1].map((r) => {
            const count = distribution[r] || 0;
            const percentage = totalReviews ? (count / totalReviews) * 100 : 0;

            return (
              <div key={r} className="flex items-center gap-3 text-sm">
                <span className="w-[40px]">{r} stars</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="w-[40px] text-right text-gray-600">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Reviews */}
      {filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-lg font-semibold mb-1">No reviews found</h3>
            <p className="text-gray-500 text-sm">
              {selectedRatingFilter
                ? `No ${selectedRatingFilter}-star reviews yet.`
                : "Be the first to review this course!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                handleVote={handleVote}
                localVotes={localVotes}
              />
            ))}

            {/* View More Button */}
            {hasMore && (
              <div className="flex justify-center pt-6">
                <Button
                  onClick={() => {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchReviews();
                  }}
                  disabled={!hasMore}
                  variant="outline"
                >
                  View More
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
