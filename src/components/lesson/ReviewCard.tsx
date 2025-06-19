"use client";

import { useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { Button } from "../ui/button";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const renderStars = (rating: number, size = "h-4 w-4") => {
  return [1, 2, 3, 4, 5].map((star) => (
    <Star
      key={star}
      className={cn(
        size,
        star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
      )}
    />
  ));
};

export default function ReviewCard({
  review,
  handleVote,
  localVotes,
}: {
  review: any;
  handleVote: (id: string, isHelpful: boolean, currentVote: boolean) => void;
  localVotes: Record<string, boolean | undefined>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const showMore = review.comment.length > 100;
  const commentPreview = review.comment.slice(0, 100);

  const renderVoteButtons = () => (
    <>
      <Button
        onClick={() =>
          handleVote(review.id, true, localVotes[review.id] ?? review.voted)
        }
        className={cn(
          "px-3 py-1.5 rounded-md border text-sm font-medium transition-colors",
          localVotes[review.id] === true
            ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
        )}
      >
        👍 {review.helpful + (localVotes[review.id] === true ? 1 : 0)}
      </Button>
      <Button
        onClick={() =>
          handleVote(review.id, false, localVotes[review.id] ?? review.voted)
        }
        className={cn(
          "px-3 py-1.5 rounded-md border text-sm font-medium transition-colors",
          localVotes[review.id] === false
            ? "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
        )}
      >
        👎 {review.notHelpful + (localVotes[review.id] === false ? 1 : 0)}
      </Button>
    </>
  );

  return (
    <div className="pb-4 border-b last:border-b-0">
      <div className="flex flex-col gap-3 sm:items-start">
        {/* Avatar + Name block (row on all sizes) */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.user.avatar} />
            <AvatarFallback>
              <Image src="/avatar.jpeg" alt="Fallback" width={40} height={40} />
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold">{review.user?.name}</h4>
            <p className="text-sm text-gray-500">
              {formatDate(review.createdAt)}
            </p>
          </div>
        </div>

        {/* Review Body */}
        <div className="flex flex-col md:flex-row mt-2 sm:mt-0 w-full gap-2 md:gap-3">
          {/* Text Section */}
          <div className="flex-1 flex flex-col">
            {/* Rating */}
            <div className="flex items-center gap-1">
              {renderStars(review.rating)}
              <span className="text-xs text-gray-600">({review.rating}/5)</span>
            </div>

            {/* Comment */}
            <p className="text-sm text-gray-800 mt-2 whitespace-pre-line">
              {isExpanded || !showMore
                ? review.comment
                : `${commentPreview}...`}
            </p>

            {/* Expand Button */}
            {showMore && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1 text-xs text-blue-500 hover:underline"
              >
                {isExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          {/* Vote Buttons: bottom on mobile, right on desktop */}
          <div className="flex md:justify-end gap-2">{renderVoteButtons()}</div>
        </div>
      </div>
    </div>
  );
}
