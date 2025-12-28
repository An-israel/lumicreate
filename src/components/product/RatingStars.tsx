import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  totalReviews?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export default function RatingStars({ 
  rating, 
  totalReviews = 0, 
  size = "sm",
  showCount = true 
}: RatingStarsProps) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size],
              rating >= star
                ? "fill-yellow-400 text-yellow-400"
                : rating >= star - 0.5
                ? "fill-yellow-400/50 text-yellow-400"
                : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
      {showCount && totalReviews > 0 && (
        <span className="text-xs text-muted-foreground">
          ({totalReviews})
        </span>
      )}
    </div>
  );
}
