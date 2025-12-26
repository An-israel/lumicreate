import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight, BookOpen, Video, Lightbulb, TrendingUp, Search, Loader2, CheckCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { blogPosts } from "@/lib/blogData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { name: "All", count: blogPosts.length },
  { name: "Equipment Guide", count: blogPosts.filter(p => p.category === "Equipment Guide").length },
  { name: "Tutorial", count: blogPosts.filter(p => p.category === "Tutorial").length },
  { name: "Growth Strategy", count: blogPosts.filter(p => p.category === "Growth Strategy").length },
  { name: "Resources", count: blogPosts.filter(p => p.category === "Resources").length },
];

const Resources = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Filter posts based on search and category
  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesSearch = searchQuery === "" || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const featuredPosts = filteredPosts.filter(p => p.featured);
  const regularPosts = filteredPosts.filter(p => !p.featured);

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

    // Basic email validation
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
    
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.trim().toLowerCase() });

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
        setIsSubscribed(true);
        setEmail("");
        toast({
          title: "Subscribed!",
          description: "Welcome! You'll receive our latest creator tips soon.",
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

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Tutorials, equipment guides, and growth strategies to help Nigerian creators succeed. 
              Learn from the best and elevate your content.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-base bg-background/80 backdrop-blur-sm"
              />
            </div>
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
                variant={selectedCategory === category.name ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-1.5"
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name} ({category.count})
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Results Info */}
      {(searchQuery || selectedCategory !== "All") && (
        <section className="py-4 bg-muted/20">
          <div className="container">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {filteredPosts.length} article{filteredPosts.length !== 1 ? "s" : ""}
                {searchQuery && ` for "${searchQuery}"`}
                {selectedCategory !== "All" && ` in ${selectedCategory}`}
              </p>
              {(searchQuery || selectedCategory !== "All") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container">
            <h2 className="text-2xl font-bold text-foreground mb-8">Featured Articles</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {featuredPosts.map((post, index) => (
                <Card key={post.id} className={`overflow-hidden card-hover ${index === 0 && featuredPosts.length >= 3 ? "md:col-span-2 md:row-span-2" : ""}`}>
                  <Link to={`/resources/${post.id}`}>
                    <div className={`relative ${index === 0 && featuredPosts.length >= 3 ? "aspect-[16/9] md:aspect-[16/10]" : "aspect-video"}`}>
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
                      <h3 className={`font-semibold text-foreground mb-2 ${index === 0 && featuredPosts.length >= 3 ? "text-xl md:text-2xl" : "text-lg"}`}>
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                      <span className="text-primary hover:text-primary/80 inline-flex items-center">
                        Read Article <ArrowRight className="h-4 w-4 ml-1" />
                      </span>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      {regularPosts.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-2xl font-bold text-foreground mb-8">All Articles</h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {regularPosts.map((post) => (
                <Link key={post.id} to={`/resources/${post.id}`}>
                  <Card className="overflow-hidden card-hover h-full">
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
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No Results */}
      {filteredPosts.length === 0 && (
        <section className="py-20">
          <div className="container text-center">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No articles found</h2>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <Button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}>
              Clear filters
            </Button>
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="py-16 md:py-20">
        <div className="container">
          <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                {isSubscribed ? (
                  <CheckCircle className="h-8 w-8 text-primary" />
                ) : (
                  <Lightbulb className="h-8 w-8 text-primary" />
                )}
              </div>
              
              {isSubscribed ? (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    You're on the List!
                  </h2>
                  <p className="text-muted-foreground max-w-xl mx-auto">
                    Thanks for subscribing! You'll receive our latest creator tips and guides directly in your inbox.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    Get Creator Tips in Your Inbox
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                    Join 5,000+ Nigerian creators receiving weekly tips on equipment, content strategy, 
                    and growing your audience. No spam, just value.
                  </p>
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1"
                      disabled={isSubscribing}
                    />
                    <Button type="submit" disabled={isSubscribing}>
                      {isSubscribing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        "Subscribe"
                      )}
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Popular Topics</h2>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => setSelectedCategory("Equipment Guide")}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Camera Guides</p>
                <p className="text-sm text-muted-foreground">Find your perfect camera</p>
              </div>
            </button>
            
            <button 
              onClick={() => setSelectedCategory("Tutorial")}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Audio Tutorials</p>
                <p className="text-sm text-muted-foreground">Sound like a pro</p>
              </div>
            </button>
            
            <button 
              onClick={() => setSelectedCategory("Tutorial")}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Lighting Tips</p>
                <p className="text-sm text-muted-foreground">Master your lighting</p>
              </div>
            </button>
            
            <button 
              onClick={() => setSelectedCategory("Growth Strategy")}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">Growth Strategies</p>
                <p className="text-sm text-muted-foreground">Grow your audience</p>
              </div>
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Resources;
