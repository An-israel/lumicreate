import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  review_text: string | null;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  user_name?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

export function useReviews(productId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const { user } = useAuth();

  const fetchReviews = async () => {
    if (!productId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const reviewsData = data || [];
      setReviews(reviewsData);

      // Calculate stats
      if (reviewsData.length > 0) {
        const total = reviewsData.length;
        const sum = reviewsData.reduce((acc, r) => acc + r.rating, 0);
        const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviewsData.forEach((r) => {
          distribution[r.rating] = (distribution[r.rating] || 0) + 1;
        });

        setStats({
          averageRating: sum / total,
          totalReviews: total,
          ratingDistribution: distribution,
        });
      }

      // Find user's review
      if (user) {
        const found = reviewsData.find((r) => r.user_id === user.id);
        setUserReview(found || null);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, user?.id]);

  const addReview = async (rating: number, title: string, reviewText: string) => {
    if (!user || !productId) {
      toast.error("Please log in to leave a review");
      return false;
    }

    try {
      const { error } = await supabase.from("product_reviews").insert({
        product_id: productId,
        user_id: user.id,
        rating,
        title,
        review_text: reviewText,
      });

      if (error) throw error;

      toast.success("Review submitted successfully!");
      await fetchReviews();
      return true;
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("You've already reviewed this product");
      } else {
        toast.error("Failed to submit review");
      }
      return false;
    }
  };

  const updateReview = async (reviewId: string, rating: number, title: string, reviewText: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("product_reviews")
        .update({
          rating,
          title,
          review_text: reviewText,
        })
        .eq("id", reviewId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Review updated!");
      await fetchReviews();
      return true;
    } catch (error) {
      toast.error("Failed to update review");
      return false;
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("product_reviews")
        .delete()
        .eq("id", reviewId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Review deleted");
      await fetchReviews();
      return true;
    } catch (error) {
      toast.error("Failed to delete review");
      return false;
    }
  };

  return {
    reviews,
    stats,
    isLoading,
    userReview,
    addReview,
    updateReview,
    deleteReview,
    refetch: fetchReviews,
  };
}
