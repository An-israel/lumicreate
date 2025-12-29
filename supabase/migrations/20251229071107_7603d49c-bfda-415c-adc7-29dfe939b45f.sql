-- Add featured flag and view count to blog_posts
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

-- Create index for featured posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON public.blog_posts (is_featured) WHERE is_featured = true;