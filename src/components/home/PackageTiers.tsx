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
    <section className="section border-t border-border">
      <div className="container">
        <SectionHeader eyebrow="Equipment packages" title={title} subtitle={subtitle} />

        {/* Tier Cards */}
        <div className="grid gap-4 md:grid-cols-3 max-w-6xl mx-auto">
          {defaultTiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "relative flex flex-col rounded-2xl border p-8 transition-colors",
                tier.popular ? "border-foreground" : "border-border hover:border-foreground/20"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{tier.name}</h3>
                {tier.popular && (
                  <span className="rounded-full bg-foreground px-2.5 py-0.5 text-xs font-medium text-background">
                    Most popular
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>

              <p className="mt-8 text-3xl font-semibold tracking-tight">{tier.priceRange}</p>

              <ul className="mt-8 space-y-3 border-t border-border pt-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="mt-10 w-full"
                variant={tier.popular ? "default" : "outline"}
                asChild
              >
                <Link to={`/packages/${tier.name.toLowerCase()}`}>
                  Browse {tier.name}
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <p className="mt-12 text-center text-sm text-muted-foreground">
          Not sure which tier is right for you?{" "}
          <Link to="/quiz" className="inline-flex items-center gap-1 font-medium text-primary hover:underline underline-offset-4">
            Take the 2-minute quiz
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </p>
      </div>
    </section>
  );
};

export default PackageTiers;
