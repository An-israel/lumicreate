import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
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

  const showcase = [
    {
      label: "Video",
      caption: "Cameras & capture",
      image: content?.showcase_image_1 || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900&q=80",
      href: "/shop",
    },
    {
      label: "Lighting",
      caption: "Ring lights & panels",
      image: content?.showcase_image_2 || "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=900&q=80",
      href: "/shop",
    },
    {
      label: "Audio",
      caption: "Mics & interfaces",
      image: content?.showcase_image_3 || "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=900&q=80",
      href: "/shop",
    },
  ];

  return (
    <section className="pt-16 pb-20 md:pt-28 md:pb-28">
      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <Link
            to={ctaSecondaryLink}
            className="mb-8 inline-flex items-center gap-1 rounded-full border border-border px-3.5 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground animate-fade-in"
          >
            {badgeText}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>

          {/* Headline */}
          <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-[5.5rem] lg:leading-[1.02] animate-fade-in" style={{ animationDelay: "0.05s" }}>
            {titleLine1}{" "}
            <span className="text-muted-foreground">{titleHighlight}</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground md:text-xl animate-fade-in" style={{ animationDelay: "0.1s" }}>
            {subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link to={ctaPrimaryLink}>
                {ctaPrimaryText}
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link to={ctaSecondaryLink}>{ctaSecondaryText}</Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <li>{trustCreators}</li>
            <li className="flex items-center gap-1.5">
              <span className="text-foreground">★</span>
              {trustRating}
            </li>
            <li>{trustDelivery}</li>
          </ul>
        </div>

        {/* Category showcase */}
        <div className="mt-16 grid gap-4 sm:grid-cols-3 md:mt-24 animate-fade-in" style={{ animationDelay: "0.25s" }}>
          {showcase.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="group relative block aspect-[16/10] overflow-hidden rounded-2xl bg-muted sm:aspect-[3/4]"
            >
              <img
                src={item.image}
                alt={item.label}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5 pt-16 text-white">
                <p className="text-lg font-semibold">{item.label}</p>
                <p className="text-sm text-white/75">{item.caption}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
