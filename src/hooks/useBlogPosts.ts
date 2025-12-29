import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  category: string;
  author_name: string;
  author_avatar: string | null;
  read_time: string | null;
  is_published: boolean;
  is_featured: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  user_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface BlogLike {
  id: string;
  post_id: string;
  user_id: string | null;
  session_id: string | null;
  created_at: string;
}

// Get or create session ID for anonymous likes
const getSessionId = () => {
  let sessionId = localStorage.getItem("blog_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    localStorage.setItem("blog_session_id", sessionId);
  }
  return sessionId;
};

export function useBlogPosts(publishedOnly = true) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);

    let query = supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (publishedOnly) {
      query = query.eq("is_published", true);
    }

    const { data, error: queryError } = await query;

    if (queryError) {
      setError(queryError);
    } else {
      setPosts(data as BlogPost[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [publishedOnly]);

  return { posts, isLoading, error, refetch: fetchPosts };
}

export function useBlogPost(slug: string | undefined) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    const fetchPost = async () => {
      setIsLoading(true);
      const { data, error: queryError } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .single();

      if (queryError) {
        setError(queryError);
      } else {
        setPost(data as BlogPost);
      }
      setIsLoading(false);
    };

    fetchPost();
  }, [slug]);

  return { post, isLoading, error };
}

export function useBlogLikes(postId: string | undefined) {
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLikes = async () => {
    if (!postId) return;

    const sessionId = getSessionId();
    
    // Get like count
    const { count } = await supabase
      .from("blog_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    setLikeCount(count || 0);

    // Check if current user/session has liked
    const { data: userLike } = await supabase
      .from("blog_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("session_id", sessionId)
      .maybeSingle();

    setHasLiked(!!userLike);
    setIsLoading(false);
  };

  const toggleLike = async () => {
    if (!postId) return;

    const sessionId = getSessionId();

    if (hasLiked) {
      await supabase
        .from("blog_likes")
        .delete()
        .eq("post_id", postId)
        .eq("session_id", sessionId);
      
      setLikeCount((prev) => prev - 1);
      setHasLiked(false);
    } else {
      await supabase.from("blog_likes").insert({
        post_id: postId,
        session_id: sessionId,
      });
      
      setLikeCount((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  useEffect(() => {
    fetchLikes();
  }, [postId]);

  return { likeCount, hasLiked, toggleLike, isLoading };
}

export function useBlogComments(postId: string | undefined) {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = async () => {
    if (!postId) return;

    setIsLoading(true);
    
    const { data } = await supabase
      .from("blog_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (data) {
      // Fetch user profiles for comments
      const userIds = [...new Set(data.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const commentsWithProfiles = data.map((comment) => ({
        ...comment,
        user_profile: profiles?.find((p) => p.user_id === comment.user_id) || null,
      }));

      setComments(commentsWithProfiles as BlogComment[]);
    }
    setIsLoading(false);
  };

  const addComment = async (content: string, userId: string) => {
    if (!postId || !content.trim()) return false;

    const { error } = await supabase.from("blog_comments").insert({
      post_id: postId,
      user_id: userId,
      content: content.trim(),
    });

    if (!error) {
      await fetchComments();
      return true;
    }
    return false;
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from("blog_comments")
      .delete()
      .eq("id", commentId);

    if (!error) {
      await fetchComments();
      return true;
    }
    return false;
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return { comments, isLoading, addComment, deleteComment, refetch: fetchComments };
}
