import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/layout/SectionHeader";
import { cn } from "@/lib/utils";
import { usePageContent, useSectionVisibility } from "@/hooks/usePageContent";

const defaultTiers = [
  {
    name: "Basic",
    description: "Perfect for beginners starting their content journey",
    priceRange: "₦15,000 - ₦50,000",
    features: [
      "Ring lights & basic lighting",
      "Smartphone tripods",
      "Clip-on lapel mics",
      "Basic backdrops",
      "Entry-level accessories",
    ],
    popular: false,
  },
  {
    name: "Premium",
    description: "For creators ready to level up their production quality",
    priceRange: "₦50,000 - ₦200,000",
    features: [
      "LED panel lighting systems",
      "USB condenser microphones",
      "HD webcams & capture cards",
      "Boom arms & shock mounts",
      "Professional backdrops",
      "Acoustic treatment basics",
    ],
    popular: true,
  },
  {
    name: "Diamond",
    description: "Professional-grade equipment for serious creators",
    priceRange: "₦200,000+",
    features: [
      "Softbox & studio lighting",
      "XLR microphone setups",
      "Audio interfaces & mixers",
      "Camera options (DSLR ready)",
      "Complete studio packages",
      "Priority support & setup help",
    ],
    popular: false,
  },
];

const PackageTiers = () => {
  const { content } = usePageContent("home", "package_tiers");
  const { isSectionVisible } = useSectionVisibility("home");

  // Don't render if section is hidden
  if (!isSectionVisible("package_tiers")) {
    return null;
  }

  const title = content?.title || "Choose Your Tier";
  const subtitle = content?.subtitle || "Curated packages designed for every stage of your creator journey. All equipment is carefully selected for Nigerian creators.";

  return (
    <section className="section">
      <div className="container">
        <SectionHeader eyebrow="Equipment packages" title={title} subtitle={subtitle} />

        {/* Tier Cards */}
        <div className="grid gap-5 md:grid-cols-3 md:items-center max-w-6xl mx-auto">
          {defaultTiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "relative flex flex-col rounded-[1.75rem] border p-8 transition-all duration-300 md:p-9",
                tier.popular
                  ? "surface-ink border-ink-border shadow-[0_30px_60px_-30px_hsl(30_20%_8%/0.6)] md:-translate-y-3"
                  : "border-border bg-card hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_hsl(30_20%_10%/0.35)]"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif-display text-3xl">{tier.name}</h3>
                {tier.popular && (
                  <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-foreground">
                    Most popular
                  </span>
                )}
              </div>
              <p className={cn("mt-3 text-sm leading-relaxed", tier.popular ? "text-ink-muted" : "text-muted-foreground")}>
                {tier.description}
              </p>

              <p className="mt-8 text-3xl font-semibold tracking-tight">{tier.priceRange}</p>

              <ul className={cn("mt-8 space-y-3.5 border-t pt-8", tier.popular ? "border-ink-border" : "border-border")}>
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <span className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                      tier.popular ? "bg-brand text-brand-foreground" : "bg-brand-soft text-foreground"
                    )}>
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className={tier.popular ? "text-ink-foreground/85" : "text-muted-foreground"}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={cn("mt-10 w-full", !tier.popular && "bg-transparent")}
                variant={tier.popular ? "brand" : "outline"}
                size="lg"
                asChild
              >
                <Link to={`/packages/${tier.name.toLowerCase()}`}>
                  Browse {tier.name}
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <p className="mt-12 text-center text-sm text-muted-foreground">
          Not sure which tier is right for you?{" "}
          <Link to="/quiz" className="inline-flex items-center gap-1 font-medium text-foreground underline decoration-brand decoration-2 underline-offset-4 hover:decoration-foreground">
            Take the 2-minute quiz
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </p>
      </div>
    </section>
  );
};

export default PackageTiers;
