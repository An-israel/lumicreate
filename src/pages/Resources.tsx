import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Video, Lightbulb, TrendingUp, Search, Loader2, Mic } from "lucide-react";
import Layout from "@/components/layout/Layout";
import PageHero from "@/components/layout/PageHero";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Resources = () => {
  const { toast } = useToast();
  const { posts: blogPosts, isLoading: postsLoading } = useBlogPosts(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Generate categories dynamically from posts
  const categories = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    blogPosts.forEach((post) => {
      categoryMap[post.category] = (categoryMap[post.category] || 0) + 1;
    });
    return [
      { name: "All", count: blogPosts.length },
      ...Object.entries(categoryMap).map(([name, count]) => ({ name, count })),
    ];
  }, [blogPosts]);

  // Filter posts based on search and category
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.excerpt || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [blogPosts, searchQuery, selectedCategory]);

  // For now, mark first 2 posts as featured
  const featuredPosts = filteredPosts.slice(0, 2);
  const regularPosts = filteredPosts.slice(2);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubscribing(true);
    const trimmedEmail = email.trim().toLowerCase();

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: trimmedEmail });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already subscribed",
            description: "This email is already on our mailing list!",
          });
        } else {
          throw error;
        }
      } else {
        supabase.functions
          .invoke("send-newsletter-welcome", {
            body: { email: trimmedEmail },
          })
          .then(({ error: emailError }) => {
            if (emailError) {
              console.error("Failed to send welcome email:", emailError);
            }
          });

        setIsSubscribed(true);
        setEmail("");
        toast({
          title: "Subscribed!",
          description: "Welcome! Check your inbox for a confirmation email.",
        });
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Subscription failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  if (postsLoading) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground mt-4">Loading articles…</p>
        </div>
      </Layout>
    );
  }

  const formatDate = (post: { published_at: string | null; created_at: string }) =>
    format(new Date(post.published_at || post.created_at), "MMM d, yyyy");

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  const topics = [
    { category: "equipment", icon: Video, title: "Camera guides", description: "Find your perfect camera" },
    { category: "tutorials", icon: Mic, title: "Audio tutorials", description: "Sound like a pro" },
    { category: "tips", icon: Lightbulb, title: "Lighting tips", description: "Master your lighting" },
    { category: "news", icon: TrendingUp, title: "Growth strategy", description: "Grow your audience" },
  ];

  return (
    <Layout>
      <PageHero
        eyebrow="Creator resources"
        title="Level up your content"
        subtitle="Tutorials, equipment guides, and growth strategies to help Nigerian creators succeed."
      >
        <div className="relative mx-auto max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search articles"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 rounded-full border-transparent bg-muted pl-11 text-base focus-visible:bg-background"
          />
        </div>
      </PageHero>

      {/* Categories */}
      <section className="border-b border-border py-4">
        <div className="container">
          <div className="flex gap-2 overflow-x-auto md:flex-wrap md:justify-center">
            {categories.map((category) => {
              const active = selectedCategory === category.name;
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-1.5 text-sm capitalize transition-colors",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {category.name}
                  <span className={cn("ml-1.5 text-xs tabular-nums", active ? "text-background/60" : "text-muted-foreground/70")}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Results Info */}
      {(searchQuery || selectedCategory !== "All") && (
        <div className="container pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              {filteredPosts.length} article{filteredPosts.length !== 1 ? "s" : ""}
              {searchQuery && ` for "${searchQuery}"`}
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
            </p>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        </div>
      )}

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="pt-14 pb-6 md:pt-20">
          <div className="container">
            <h2 className="eyebrow mb-6">Featured</h2>

            <div className="grid gap-x-6 gap-y-12 md:grid-cols-2">
              {featuredPosts.map((post) => (
                <Link key={post.id} to={`/resources/${post.slug}`} className="group block">
                  <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <p className="mt-5 text-xs capitalize text-muted-foreground">
                    {post.category} · {formatDate(post)}
                    {post.read_time && ` · ${post.read_time}`}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold leading-snug text-foreground group-hover:underline underline-offset-4 decoration-1">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      {regularPosts.length > 0 && (
        <section className="py-14 md:py-20">
          <div className="container">
            <h2 className="eyebrow mb-6">All articles</h2>

            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {regularPosts.map((post) => (
                <Link key={post.id} to={`/resources/${post.slug}`} className="group block">
                  <div className="aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <p className="mt-4 text-xs capitalize text-muted-foreground">
                    {post.category} · {formatDate(post)}
                  </p>
                  <h3 className="mt-1.5 font-semibold leading-snug text-foreground line-clamp-2 group-hover:underline underline-offset-4 decoration-1">
                    {post.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No Results */}
      {filteredPosts.length === 0 && (
        <section className="py-20">
          <div className="container">
            <div className="panel py-16 text-center">
              <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" strokeWidth={1.25} />
              <h2 className="text-lg font-semibold text-foreground">
                No articles found
              </h2>
              <p className="mt-1 text-muted-foreground mb-6">
                Try adjusting your search or filter.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Popular topics */}
      <section className="pb-14 md:pb-20">
        <div className="container">
          <h2 className="eyebrow mb-6">Popular topics</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {topics.map((topic) => (
              <button
                key={topic.category}
                onClick={() => {
                  setSelectedCategory(topic.category);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-4 rounded-2xl border border-border p-5 text-left transition-colors hover:border-foreground/20"
              >
                <topic.icon className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                <div>
                  <p className="font-medium text-foreground">{topic.title}</p>
                  <p className="text-sm text-muted-foreground">{topic.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section bg-muted/40">
        <div className="container">
          <div className="mx-auto max-w-xl text-center">
            {isSubscribed ? (
              <>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  You're on the list
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Thanks for subscribing! You'll receive our latest creator tips
                  and guides directly in your inbox.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  Creator tips in your inbox
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Join 5,000+ Nigerian creators receiving weekly tips on equipment,
                  content strategy, and growing your audience. No spam.
                </p>
                <form
                  onSubmit={handleSubscribe}
                  className="mt-8 flex flex-col gap-3 sm:flex-row"
                >
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 flex-1 rounded-full bg-background px-5"
                    disabled={isSubscribing}
                  />
                  <Button type="submit" className="h-11" disabled={isSubscribing}>
                    {isSubscribing ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Subscribing…
                      </>
                    ) : (
                      "Subscribe"
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Resources;
