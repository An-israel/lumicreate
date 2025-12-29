-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Create storage policies for product images
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND is_admin_or_staff(auth.uid()));

-- Create page_content table for CMS
CREATE TABLE public.page_content (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    page_key TEXT NOT NULL,
    section_key TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(page_key, section_key)
);

ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view page content"
ON public.page_content FOR SELECT
USING (true);

CREATE POLICY "Admins can insert page content"
ON public.page_content FOR INSERT
WITH CHECK (is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can update page content"
ON public.page_content FOR UPDATE
USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can delete page content"
ON public.page_content FOR DELETE
USING (is_admin_or_staff(auth.uid()));

CREATE TRIGGER update_page_content_updated_at
BEFORE UPDATE ON public.page_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create blog_posts table
CREATE TABLE public.blog_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    author_name TEXT NOT NULL DEFAULT 'Luminaire Team',
    author_avatar TEXT,
    read_time TEXT DEFAULT '5 min read',
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blog posts"
ON public.blog_posts FOR SELECT
USING (is_published = true OR is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can insert blog posts"
ON public.blog_posts FOR INSERT
WITH CHECK (is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can update blog posts"
ON public.blog_posts FOR UPDATE
USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Admins can delete blog posts"
ON public.blog_posts FOR DELETE
USING (is_admin_or_staff(auth.uid()));

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create blog_likes table (public likes, no login required for liking)
CREATE TABLE public.blog_likes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(post_id, user_id),
    UNIQUE(post_id, session_id)
);

ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
ON public.blog_likes FOR SELECT
USING (true);

CREATE POLICY "Anyone can like posts"
ON public.blog_likes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can remove own likes"
ON public.blog_likes FOR DELETE
USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Create blog_comments table (login required for commenting)
CREATE TABLE public.blog_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved comments"
ON public.blog_comments FOR SELECT
USING (is_approved = true OR auth.uid() = user_id OR is_admin_or_staff(auth.uid()));

CREATE POLICY "Authenticated users can comment"
ON public.blog_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
ON public.blog_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments or admins"
ON public.blog_comments FOR DELETE
USING (auth.uid() = user_id OR is_admin_or_staff(auth.uid()));

CREATE TRIGGER update_blog_comments_updated_at
BEFORE UPDATE ON public.blog_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();