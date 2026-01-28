import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePageContent, useSectionVisibility } from "@/hooks/usePageContent";

const defaultBlogPosts = [
  {
    id: "best-cameras-nigerian-creators-2024",
    title: "Best Cameras for Nigerian Content Creators in 2024",
    excerpt: "A comprehensive guide to choosing the right camera for your content type and budget.",
    category: "Equipment Guide",
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
  },
  {
    id: "lighting-setup-home-studio",
    title: "How to Set Up Professional Lighting at Home",
    excerpt: "Transform any room into a content creation studio with our lighting guide.",
    category: "Tutorial",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400",
  },
  {
    id: "podcast-equipment-beginners",
    title: "Essential Podcast Equipment for Beginners",
    excerpt: "Everything you need to know about mics and audio interfaces.",
    category: "Equipment Guide",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400",
  },
];

const ResourcesSection = () => {
  const { content } = usePageContent("home", "resources");
  const { isSectionVisible } = useSectionVisibility("home");

  // Don't render if section is hidden
  if (!isSectionVisible("resources")) {
    return null;
  }

  const title = content?.title || "Learn & Grow";
  const subtitle = content?.subtitle || "Equipment guides, tutorials, and growth strategies to help you create better content.";
  const ctaText = content?.cta_text || "View All Articles";
  const ctaLink = content?.cta_link || "/resources";

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-sm mb-4">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Creator Resources</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {title}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              {subtitle}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to={ctaLink}>
              {ctaText}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {defaultBlogPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden card-hover group">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground">
                  {post.category}
                </Badge>
              </div>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Clock className="h-4 w-4" />
                  {post.readTime}
                </div>
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {post.excerpt}
                </p>
                <Link 
                  to={`/resources/${post.id}`}
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
                >
                  Read More <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;
