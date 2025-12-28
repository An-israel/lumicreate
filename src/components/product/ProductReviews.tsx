import { useState } from "react";
import { Star, ThumbsUp, User, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useReviews, Review, ReviewStats } from "@/hooks/useReviews";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ProductReviewsProps {
  productId: string;
}

const StarRating = ({ 
  rating, 
  onRatingChange, 
  size = "md",
  interactive = false 
}: { 
  rating: number; 
  onRatingChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            "transition-colors",
            interactive && "cursor-pointer",
            (interactive ? hoverRating || rating : rating) >= star
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/30"
          )}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && onRatingChange?.(star)}
        />
      ))}
    </div>
  );
};

const RatingDistribution = ({ stats }: { stats: ReviewStats }) => {
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = stats.ratingDistribution[star] || 0;
        const percentage = stats.totalReviews > 0 
          ? (count / stats.totalReviews) * 100 
          : 0;

        return (
          <div key={star} className="flex items-center gap-3">
            <span className="text-sm w-3">{star}</span>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <Progress value={percentage} className="flex-1 h-2" />
            <span className="text-sm text-muted-foreground w-8">{count}</span>
          </div>
        );
      })}
    </div>
  );
};

const ReviewCard = ({ 
  review, 
  isOwner,
  onEdit,
  onDelete 
}: { 
  review: Review; 
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Customer</span>
                {review.is_verified_purchase && (
                  <Badge variant="secondary" className="text-xs">
                    Verified Purchase
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} size="sm" />
            {isOwner && (
              <div className="flex gap-1 ml-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {review.title && (
          <h4 className="font-semibold mt-4">{review.title}</h4>
        )}
        {review.review_text && (
          <p className="text-muted-foreground mt-2">{review.review_text}</p>
        )}
        
        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
          <Button variant="ghost" size="sm" className="gap-2">
            <ThumbsUp className="h-4 w-4" />
            Helpful ({review.helpful_count})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ReviewForm = ({ 
  onSubmit, 
  initialData,
  onCancel 
}: { 
  onSubmit: (rating: number, title: string, text: string) => Promise<boolean>;
  initialData?: { rating: number; title: string; text: string };
  onCancel?: () => void;
}) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [title, setTitle] = useState(initialData?.title || "");
  const [text, setText] = useState(initialData?.text || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    
    setIsSubmitting(true);
    const success = await onSubmit(rating, title, text);
    setIsSubmitting(false);
    
    if (success && !initialData) {
      setRating(0);
      setTitle("");
      setText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Your Rating</label>
        <StarRating rating={rating} onRatingChange={setRating} size="lg" interactive />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Review Title (optional)</label>
        <Input
          placeholder="Summarize your experience"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Your Review (optional)</label>
        <Textarea
          placeholder="Tell others what you think about this product..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
        />
      </div>
      
      <div className="flex gap-2">
        <Button type="submit" disabled={rating === 0 || isSubmitting}>
          {isSubmitting ? "Submitting..." : initialData ? "Update Review" : "Submit Review"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { reviews, stats, isLoading, userReview, addReview, updateReview, deleteReview } = useReviews(productId);
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse w-48" />
        <div className="h-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Customer Reviews</h2>
      
      {/* Rating Overview */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold">{stats.averageRating.toFixed(1)}</div>
              <StarRating rating={Math.round(stats.averageRating)} size="lg" />
              <p className="text-muted-foreground mt-2">
                Based on {stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>
            <RatingDistribution stats={stats} />
          </CardContent>
        </Card>

        {/* Write Review */}
        <Card>
          <CardHeader>
            <CardTitle>
              {userReview ? "Your Review" : "Write a Review"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!user ? (
              <p className="text-muted-foreground">
                Please <a href="/auth" className="text-primary hover:underline">sign in</a> to leave a review.
              </p>
            ) : userReview && !isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <StarRating rating={userReview.rating} />
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(userReview.created_at), { addSuffix: true })}
                  </span>
                </div>
                {userReview.title && <h4 className="font-semibold">{userReview.title}</h4>}
                {userReview.review_text && <p className="text-muted-foreground">{userReview.review_text}</p>}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive"
                    onClick={() => deleteReview(userReview.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <ReviewForm
                onSubmit={userReview 
                  ? (r, t, txt) => updateReview(userReview.id, r, t, txt)
                  : addReview
                }
                initialData={userReview && isEditing ? {
                  rating: userReview.rating,
                  title: userReview.title || "",
                  text: userReview.review_text || "",
                } : undefined}
                onCancel={isEditing ? () => setIsEditing(false) : undefined}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <Separator />
          <h3 className="text-lg font-semibold">All Reviews ({reviews.length})</h3>
          <div className="space-y-4">
            {reviews
              .filter(r => r.id !== userReview?.id)
              .map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isOwner={user?.id === review.user_id}
                  onEdit={() => setIsEditing(true)}
                  onDelete={() => deleteReview(review.id)}
                />
              ))}
          </div>
        </div>
      )}

      {reviews.length === 0 && !userReview && (
        <Card>
          <CardContent className="py-12 text-center">
            <Star className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold mb-2">No reviews yet</h3>
            <p className="text-muted-foreground">Be the first to review this product!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
