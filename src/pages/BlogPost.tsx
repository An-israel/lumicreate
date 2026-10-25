import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Calendar, Clock, ArrowLeft, ArrowRight, User, Share2, BookOpen } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useBlogPost, useBlogPosts } from "@/hooks/useBlogPosts";
import BlogLikeButton from "@/components/blog/BlogLikeButton";
import BlogComments from "@/components/blog/BlogComments";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { post, isLoading, error } = useBlogPost(slug);
  const { posts: allPosts } = useBlogPosts(true);

  // Increment view count when post is loaded
  useEffect(() => {
    if (post?.id) {
      supabase
        .from("blog_posts")
        .update({ view_count: (post.view_count || 0) + 1 })
        .eq("id", post.id)
        .then();
    }
  }, [post?.id]);

  // Get related posts (same category, excluding current)
  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug && p.category === post?.category)
    .slice(0, 3);

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading article...</p>
        </div>
      </Layout>
    );
  }

  if (!post || error) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-semibold text-foreground mb-2">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or has been moved.</p>
          <Button onClick={() => navigate("/resources")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </Button>
        </div>
      </Layout>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || "",
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formattedDate = post.published_at
    ? format(new Date(post.published_at), "MMMM d, yyyy")
    : format(new Date(post.created_at), "MMMM d, yyyy");

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-8 md:pt-12">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/resources")}
            >
              <ArrowLeft />
              Resources
            </Button>

            <p className="mt-8 eyebrow capitalize">{post.category}</p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-[1.1]">
              {post.title}
            </h1>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-border py-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                {post.author_avatar ? (
                  <img
                    src={post.author_avatar}
                    alt={post.author_name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <span className="font-medium text-foreground">{post.author_name}</span>
              </div>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </span>
              {post.read_time && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {post.read_time}
                </span>
              )}
              <Button variant="ghost" size="sm" className="ml-auto" onClick={handleShare}>
                <Share2 />
                Share
              </Button>
            </div>
          </div>

          {post.image_url && (
            <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-2xl bg-muted">
              <img
                src={post.image_url}
                alt={post.title}
                className="aspect-[2/1] w-full object-cover"
              />
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-muted-foreground mb-4 space-y-2">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-muted-foreground">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">{children}</strong>
                  ),
                  a: ({ href, children }) => (
                    <Link to={href || "#"} className="text-primary hover:underline">
                      {children}
                    </Link>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6">
                      <table className="w-full border-collapse border border-border">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-muted">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-border px-4 py-2 text-muted-foreground">
                      {children}
                    </td>
                  ),
                  hr: () => <hr className="border-border my-8" />,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Like and Share */}
            <div className="mt-8 flex items-center gap-4">
              <BlogLikeButton postId={post.id} />
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Author Box */}
            <div className="mt-12 p-6 rounded-xl border border-border bg-muted/30">
              <div className="flex items-start gap-4">
                {post.author_avatar ? (
                  <img
                    src={post.author_avatar}
                    alt={post.author_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">{post.author_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Passionate about helping Nigerian creators succeed with the right equipment and strategies.
                  </p>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <Separator className="my-12" />
            <BlogComments postId={post.id} />
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="section border-t border-border">
          <div className="container">
            <h2 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">Related articles</h2>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} to={`/resources/${relatedPost.slug}`} className="group block">
                  <div className="aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                    {relatedPost.image_url && (
                      <img
                        src={relatedPost.image_url}
                        alt={relatedPost.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <p className="mt-4 text-xs capitalize text-muted-foreground">
                    {relatedPost.category} ·{" "}
                    {format(new Date(relatedPost.published_at || relatedPost.created_at), "MMM d, yyyy")}
                    {relatedPost.read_time && ` · ${relatedPost.read_time}`}
                  </p>
                  <h3 className="mt-1.5 font-semibold leading-snug text-foreground line-clamp-2 group-hover:underline underline-offset-4 decoration-1">
                    {relatedPost.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section bg-muted/40">
        <div className="container">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Ready to create professional content?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Get the equipment you need to bring your content to life. Our curated packages are designed for Nigerian creators.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link to="/shop">
                Browse equipment <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BlogPost;
