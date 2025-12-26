import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, BookOpen, Video, Lightbulb, TrendingUp } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const blogPosts = [
  {
    id: "best-cameras-nigerian-creators-2024",
    title: "Best Cameras for Nigerian Content Creators in 2024",
    excerpt: "A comprehensive guide to choosing the right camera for your content type, budget, and skill level. From smartphone upgrades to professional mirrorless options.",
    category: "Equipment Guide",
    readTime: "8 min read",
    date: "December 20, 2024",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600",
    featured: true,
  },
  {
    id: "lighting-setup-home-studio",
    title: "How to Set Up Professional Lighting in Your Home Studio",
    excerpt: "Transform any room into a content creation studio with our step-by-step lighting guide. Learn key, fill, and back lighting techniques.",
    category: "Tutorial",
    readTime: "6 min read",
    date: "December 18, 2024",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600",
    featured: true,
  },
  {
    id: "podcast-equipment-beginners",
    title: "Essential Podcast Equipment for Beginners",
    excerpt: "Starting a podcast? Here's everything you need to know about microphones, audio interfaces, and recording software without breaking the bank.",
    category: "Equipment Guide",
    readTime: "7 min read",
    date: "December 15, 2024",
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600",
    featured: true,
  },
  {
    id: "youtube-algorithm-tips",
    title: "10 YouTube Algorithm Tips Nigerian Creators Should Know",
    excerpt: "Boost your YouTube visibility with these proven strategies. Learn about watch time, CTR, and how to optimize your content for the algorithm.",
    category: "Growth Strategy",
    readTime: "10 min read",
    date: "December 12, 2024",
    image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600",
    featured: false,
  },
  {
    id: "audio-quality-improvement",
    title: "5 Ways to Instantly Improve Your Audio Quality",
    excerpt: "Bad audio kills content faster than bad video. Learn quick fixes and long-term solutions to make your content sound professional.",
    category: "Tutorial",
    readTime: "5 min read",
    date: "December 10, 2024",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600",
    featured: false,
  },
  {
    id: "tiktok-viral-equipment",
    title: "Equipment Used by Viral TikTok Creators",
    excerpt: "What gear do the top Nigerian TikTok creators use? We break down the equipment behind viral videos and affordable alternatives.",
    category: "Equipment Guide",
    readTime: "6 min read",
    date: "December 8, 2024",
    image: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=600",
    featured: false,
  },
  {
    id: "content-calendar-template",
    title: "Free Content Calendar Template for Creators",
    excerpt: "Stay consistent with our free content calendar template. Plan, schedule, and track your content across all platforms.",
    category: "Resources",
    readTime: "4 min read",
    date: "December 5, 2024",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600",
    featured: false,
  },
  {
    id: "monetization-strategies-nigeria",
    title: "Monetization Strategies for Nigerian Creators",
    excerpt: "Beyond AdSense: Explore brand deals, sponsorships, digital products, and other revenue streams available to Nigerian content creators.",
    category: "Growth Strategy",
    readTime: "9 min read",
    date: "December 1, 2024",
    image: "https://images.unsplash.com/photo-1553729459-uj26f8e1f0e4?w=600",
    featured: false,
  },
];

const categories = [
  { name: "All", count: blogPosts.length },
  { name: "Equipment Guide", count: blogPosts.filter(p => p.category === "Equipment Guide").length },
  { name: "Tutorial", count: blogPosts.filter(p => p.category === "Tutorial").length },
  { name: "Growth Strategy", count: blogPosts.filter(p => p.category === "Growth Strategy").length },
  { name: "Resources", count: blogPosts.filter(p => p.category === "Resources").length },
];

const Resources = () => {
  const featuredPosts = blogPosts.filter(p => p.featured);
  const regularPosts = blogPosts.filter(p => !p.featured);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 py-12 md:py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm backdrop-blur-sm">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Creator Resources</span>
            </div>

            <h1 className="mb-4 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Level Up Your{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Content Game
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tutorials, equipment guides, and growth strategies to help Nigerian creators succeed. 
              Learn from the best and elevate your content.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 border-b border-border">
        <div className="container">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Badge
                key={category.name}
                variant={category.name === "All" ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-1.5"
              >
                {category.name} ({category.count})
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-12 md:py-16">
        <div className="container">
          <h2 className="text-2xl font-bold text-foreground mb-8">Featured Articles</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {featuredPosts.map((post, index) => (
              <Card key={post.id} className={`overflow-hidden card-hover ${index === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
                <div className={`relative ${index === 0 ? "aspect-[16/9] md:aspect-[16/10]" : "aspect-video"}`}>
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                    {post.category}
                  </Badge>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className={`font-semibold text-foreground mb-2 ${index === 0 ? "text-xl md:text-2xl" : "text-lg"}`}>
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {post.excerpt}
                  </p>
                  <Button variant="ghost" className="p-0 h-auto text-primary hover:text-primary/80">
                    Read Article <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-bold text-foreground mb-8">All Articles</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {regularPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden card-hover">
                <div className="aspect-video relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <Badge variant="outline" className="mb-3 text-xs">
                    {post.category}
                  </Badge>
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 md:py-20">
        <div className="container">
          <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Lightbulb className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Get Creator Tips in Your Inbox
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join 5,000+ Nigerian creators receiving weekly tips on equipment, content strategy, 
                and growing your audience. No spam, just value.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button>Subscribe</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Popular Topics</h2>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/resources?category=cameras" className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Camera Guides</p>
                <p className="text-sm text-muted-foreground">Find your perfect camera</p>
              </div>
            </Link>
            
            <Link to="/resources?category=audio" className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Audio Tutorials</p>
                <p className="text-sm text-muted-foreground">Sound like a pro</p>
              </div>
            </Link>
            
            <Link to="/resources?category=lighting" className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Lighting Tips</p>
                <p className="text-sm text-muted-foreground">Master your lighting</p>
              </div>
            </Link>
            
            <Link to="/resources?category=growth" className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">Growth Strategies</p>
                <p className="text-sm text-muted-foreground">Grow your audience</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Resources;
