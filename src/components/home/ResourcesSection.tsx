import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/layout/SectionHeader";
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
    <section className="section">
      <div className="container">
        <SectionHeader
          align="left"
          eyebrow="Creator resources"
          title={title}
          subtitle={subtitle}
          action={
            <Button variant="outline" className="bg-transparent" asChild>
              <Link to={ctaLink}>
                {ctaText}
                <ArrowRight />
              </Link>
            </Button>
          }
        />

        <div className="grid gap-x-6 gap-y-10 md:grid-cols-3">
          {defaultBlogPosts.map((post) => (
            <Link key={post.id} to={`/resources/${post.id}`} className="group block">
              <div className="aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-muted">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-brand-soft px-2.5 py-0.5 font-medium text-foreground">{post.category}</span>
                {post.readTime} read
              </p>
              <h3 className="mt-3 font-serif-display text-2xl leading-snug text-foreground decoration-brand decoration-2 underline-offset-4 group-hover:underline">
                {post.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {post.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;
