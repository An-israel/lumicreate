import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBlogLikes } from "@/hooks/useBlogPosts";
import { cn } from "@/lib/utils";

interface BlogLikeButtonProps {
  postId: string;
}

export default function BlogLikeButton({ postId }: BlogLikeButtonProps) {
  const { likeCount, hasLiked, toggleLike, isLoading } = useBlogLikes(postId);

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Heart className="h-4 w-4 mr-2" />
        <span>...</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLike}
      className={cn(
        "transition-colors",
        hasLiked && "text-red-500 hover:text-red-600"
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 mr-2 transition-all",
          hasLiked && "fill-current"
        )}
      />
      <span>{likeCount} {likeCount === 1 ? "Like" : "Likes"}</span>
    </Button>
  );
}
