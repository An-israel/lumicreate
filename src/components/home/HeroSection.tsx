import { Link } from "react-router-dom";
import { ArrowRight, Star, Truck, ShieldCheck } from "lucide-react";
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

  const images = [
    content?.showcase_image_1 || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1000&q=80",
    content?.showcase_image_2 || "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80",
    content?.showcase_image_3 || "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80",
  ];

  const contentTypes = ["YouTube", "TikTok & Reels", "Podcasts", "Live streaming", "Photography", "Vlogging", "Online courses", "Brand content"];

  return (
    <section className="relative overflow-hidden">
      {/* Warm glow */}
      <div aria-hidden className="pointer-events-none absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-brand/25 blur-3xl" />

      <div className="container relative pt-14 pb-16 md:pt-20 md:pb-24 lg:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          {/* Copy */}
          <div className="lg:col-span-6">
            <Link
              to={ctaSecondaryLink}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 py-1 pl-1 pr-3.5 text-sm text-muted-foreground backdrop-blur transition-colors hover:text-foreground animate-fade-in"
            >
              <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-brand-foreground">New</span>
              {badgeText}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <h1 className="mt-8 font-serif-display text-[3.25rem] leading-[0.98] text-foreground sm:text-7xl lg:text-[5.75rem] animate-fade-in" style={{ animationDelay: "0.05s" }}>
              {titleLine1}{" "}
              <em className="highlight not-italic sm:italic">{titleHighlight}</em>
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl animate-fade-in" style={{ animationDelay: "0.1s" }}>
              {subtitle}
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <Button size="lg" variant="brand" className="w-full sm:w-auto" asChild>
                <Link to={ctaPrimaryLink}>
                  {ctaPrimaryText}
                  <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full bg-transparent sm:w-auto" asChild>
                <Link to={ctaSecondaryLink}>{ctaSecondaryText}</Link>
              </Button>
            </div>

            {/* Trust */}
            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["CA", "OB", "AO", "FH"].map((initials, i) => (
                    <span
                      key={initials}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background text-[11px] font-semibold text-brand-foreground"
                      style={{ background: `hsl(${43 - i * 6} ${90 - i * 6}% ${72 - i * 6}%)` }}
                    >
                      {initials}
                    </span>
                  ))}
                </div>
                <div className="text-sm leading-tight">
                  <div className="flex items-center gap-0.5 text-brand">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    <span className="font-medium text-foreground">{trustRating}</span> · {trustCreators}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Collage */}
          <div className="relative lg:col-span-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <div className="grid grid-cols-5 grid-rows-6 gap-3 sm:gap-4 h-[26rem] sm:h-[34rem]">
              <div className="col-span-3 row-span-6 overflow-hidden rounded-[1.75rem] bg-muted">
                <img src={images[0]} alt="Camera setup" className="h-full w-full object-cover" />
              </div>
              <div className="col-span-2 row-span-3 overflow-hidden rounded-[1.75rem] bg-muted">
                <img src={images[1]} alt="Studio lighting" className="h-full w-full object-cover" />
              </div>
              <div className="col-span-2 row-span-3 overflow-hidden rounded-[1.75rem] bg-brand">
                <img src={images[2]} alt="Podcast microphone" className="h-full w-full object-cover" />
              </div>
            </div>

            {/* Floating cards */}
            <div className="absolute -left-3 bottom-8 flex items-center gap-3 rounded-2xl border border-border bg-background/95 p-3 pr-5 shadow-[0_20px_50px_-20px_hsl(30_20%_10%/0.35)] backdrop-blur sm:-left-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-brand-foreground">
                <Truck className="h-5 w-5" />
              </span>
              <div className="text-sm leading-tight">
                <p className="font-semibold">{trustDelivery}</p>
                <p className="text-muted-foreground">Nationwide in 2–3 days</p>
              </div>
            </div>
            <div className="absolute -top-4 right-4 hidden items-center gap-2 rounded-full border border-border bg-background/95 px-4 py-2 text-sm shadow-[0_20px_50px_-20px_hsl(30_20%_10%/0.35)] backdrop-blur sm:flex">
              <ShieldCheck className="h-4 w-4 text-success" />
              Secure checkout with Paystack
            </div>
          </div>
        </div>
      </div>

      {/* Content type marquee */}
      <div className="relative border-y border-border bg-background/60 py-5">
        <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10">
            {[...contentTypes, ...contentTypes].map((type, i) => (
              <span key={i} className="flex shrink-0 items-center gap-10 font-serif-display text-2xl text-muted-foreground md:text-3xl">
                {type}
                <span className="h-2 w-2 rounded-full bg-brand" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
