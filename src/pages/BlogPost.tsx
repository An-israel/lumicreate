import { useParams, Link, useNavigate } from "react-router-dom";
import { Calendar, Clock, ArrowLeft, ArrowRight, User, Share2, BookOpen } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useBlogPost, useBlogPosts } from "@/hooks/useBlogPosts";
import BlogLikeButton from "@/components/blog/BlogLikeButton";
import BlogComments from "@/components/blog/BlogComments";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { post, isLoading, error } = useBlogPost(slug);
  const { posts: allPosts } = useBlogPosts(true);

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
          <h1 className="text-2xl font-bold text-foreground mb-2">Article Not Found</h1>
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
      <section className="relative">
        <div className="absolute inset-0 h-[400px] md:h-[500px]">
          {post.image_url ? (
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
        </div>

        <div className="container relative pt-32 md:pt-40 pb-12">
          <Button
            variant="ghost"
            className="mb-6 text-foreground/80 hover:text-foreground"
            onClick={() => navigate("/resources")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </Button>

          <Badge className="mb-4 bg-primary text-primary-foreground capitalize">
            {post.category}
          </Badge>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 max-w-4xl">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-3">
              {post.author_avatar ? (
                <img
                  src={post.author_avatar}
                  alt={post.author_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-foreground">{post.author_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{formattedDate}</span>
            </div>
            {post.read_time && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{post.read_time}</span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
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
                    <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">{children}</h2>
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
        <section className="py-12 bg-muted/30">
          <div className="container">
            <h2 className="text-2xl font-bold text-foreground mb-8">Related Articles</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Card key={relatedPost.id} className="overflow-hidden card-hover">
                  <Link to={`/resources/${relatedPost.slug}`}>
                    <div className="aspect-video relative">
                      {relatedPost.image_url ? (
                        <img
                          src={relatedPost.image_url}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <Badge variant="outline" className="mb-3 text-xs capitalize">
                        {relatedPost.category}
                      </Badge>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          {relatedPost.published_at
                            ? format(new Date(relatedPost.published_at), "MMM d, yyyy")
                            : format(new Date(relatedPost.created_at), "MMM d, yyyy")}
                        </span>
                        {relatedPost.read_time && (
                          <>
                            <span>•</span>
                            <span>{relatedPost.read_time}</span>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16">
        <div className="container">
          <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Ready to Create Professional Content?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Get the equipment you need to bring your content to life. Our curated packages are designed for Nigerian creators.
              </p>
              <Button size="lg" asChild>
                <Link to="/shop">
                  Browse Equipment <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default BlogPost;
