import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageContent, useSectionVisibility } from "@/hooks/usePageContent";

const HeroSection = () => {
  const { content } = usePageContent("home", "hero");
  const { isSectionVisible } = useSectionVisibility("home");

  // Don't render if section is hidden
  if (!isSectionVisible("hero")) {
    return null;
  }

  // Default values
  const badgeText = content?.badge_text || "Trusted by 500+ Nigerian creators";
  const titleLine1 = content?.title_line1 || "Your Content.";
  const titleHighlight = content?.title_highlight || "Elevated.";
  const subtitle = content?.subtitle || "Curated equipment packages designed specifically for Nigerian content creators. From beginner to pro, we've got your setup covered.";
  const ctaPrimaryText = content?.cta_primary_text || "Find My Equipment";
  const ctaPrimaryLink = content?.cta_primary_link || "/quiz";
  const ctaSecondaryText = content?.cta_secondary_text || "Browse Packages";
  const ctaSecondaryLink = content?.cta_secondary_link || "/packages";
  const trustCreators = content?.trust_creators || "500+ creators";
  const trustRating = content?.trust_rating || "4.9/5 rating";
  const trustDelivery = content?.trust_delivery || "24hr Lagos delivery";

  return (
    <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/15" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-secondary/5 to-primary/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      
      {/* Animated gradient orbs for depth */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-gradient-shift" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 animate-gradient-shift-reverse" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" />

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm backdrop-blur-sm animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{badgeText}</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in" style={{ animationDelay: "0.1s" }}>
            {titleLine1}{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {titleHighlight}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl md:text-2xl max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button size="lg" className="w-full sm:w-auto gap-2 text-base" asChild>
              <Link to={ctaPrimaryLink}>
                {ctaPrimaryText}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-base" asChild>
              <Link to={ctaSecondaryLink}>
                <Play className="h-4 w-4" />
                {ctaSecondaryText}
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-muted-foreground animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/60 to-accent/60"
                  />
                ))}
              </div>
              <span className="text-sm">{trustCreators}</span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="text-warning">★</span>
                ))}
              </div>
              <span className="text-sm">{trustRating}</span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="text-sm">
              <span className="font-semibold text-foreground">{trustDelivery.split(" ")[0]}</span>{" "}
              {trustDelivery.split(" ").slice(1).join(" ")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
