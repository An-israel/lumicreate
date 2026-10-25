import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHero from "@/components/layout/PageHero";
import SectionHeader from "@/components/layout/SectionHeader";
import { Button } from "@/components/ui/button";
import { TIERS } from "@/lib/constants";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const tierDetails = {
  basic: {
    packages: 2,
    lights: "2-3 lights (Key + Fill/Background)",
    audio: "Lavalier or USB microphone",
    features: [
      "Ring light or LED panel for key lighting",
      "Portable fill or background light",
      "Entry-level microphone for clear audio",
      "Essential mounting and accessories"
    ]
  },
  premium: {
    packages: 2,
    lights: "3-4 lights (Key + Fill + Background + optional Rim)",
    audio: "XLR dynamic or condenser microphone",
    features: [
      "Professional LED key light (60W+)",
      "Bi-color fill panel with barn doors",
      "RGB background lighting options",
      "Broadcast-quality microphone",
      "Audio interface for pro sound"
    ]
  },
  diamond: {
    packages: 2,
    lights: "5-point lighting (Key + Fill + Background + Rim + Practicals)",
    audio: "Industry-standard broadcast mics + wireless",
    features: [
      "Cinema-grade key light (120W+)",
      "Multiple fill light options",
      "Full RGB background control",
      "Rim/hair light for separation",
      "Practical/accent lights for atmosphere",
      "Wireless audio systems",
      "Camera and production accessories"
    ]
  }
};

const tierOrder = ["basic", "premium", "diamond"] as const;

const Packages = () => {
  return (
    <Layout>
      <PageHero
        eyebrow="Curated equipment bundles"
        title="Creator packages"
        subtitle="Two carefully curated packages per tier. No decision paralysis — just clear choices, and up to 25% savings versus buying individually."
      />

      {/* Tier Selection Cards */}
      <section className="section">
        <div className="container">
          <SectionHeader
            title="Select your level"
            subtitle="Each tier is designed for a specific stage of the creator journey. Pick the one that matches where you are now."
          />

          <div className="grid gap-4 md:grid-cols-3">
            {tierOrder.map((tier) => {
              const tierInfo = TIERS[tier];
              const details = tierDetails[tier];
              const isPremium = tier === "premium";

              return (
                <Link
                  key={tier}
                  to={`/packages/${tier}`}
                  className={cn(
                    "group flex flex-col rounded-2xl border p-8 transition-colors",
                    isPremium ? "border-foreground" : "border-border hover:border-foreground/20"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold capitalize">{tierInfo.name}</h3>
                    {isPremium && (
                      <span className="rounded-full bg-foreground px-2.5 py-0.5 text-xs font-medium text-background">
                        Most popular
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{tierInfo.perfectFor}</p>
                  <p className="mt-8 text-3xl font-semibold tracking-tight">{tierInfo.priceRange}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{details.packages} curated packages</p>

                  <dl className="mt-8 space-y-4 border-t border-border pt-8 text-sm">
                    <div>
                      <dt className="font-medium">Lighting</dt>
                      <dd className="mt-1 text-muted-foreground">{details.lights}</dd>
                    </div>
                    <div>
                      <dt className="font-medium">Audio</dt>
                      <dd className="mt-1 text-muted-foreground">{details.audio}</dd>
                    </div>
                  </dl>

                  <ul className="mt-6 space-y-3 text-sm">
                    {details.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                    {details.features.length > 4 && (
                      <li className="pl-7 text-muted-foreground">
                        +{details.features.length - 4} more included
                      </li>
                    )}
                  </ul>

                  <span className="mt-auto pt-10">
                    <span
                      className={cn(
                        "inline-flex h-10 w-full items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors",
                        isPremium
                          ? "bg-primary text-primary-foreground group-hover:bg-primary/90"
                          : "border border-input group-hover:bg-muted"
                      )}
                    >
                      View {tierInfo.name} packages
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Packages */}
      <section className="section bg-muted/40">
        <div className="container">
          <SectionHeader
            title="Why choose a package?"
            subtitle="We've done the research so you don't have to. Each package is assembled by experienced creators who know exactly what works together."
          />
          <dl className="mx-auto grid max-w-4xl gap-10 text-center sm:grid-cols-3">
            {[
              { value: "25%", label: "Average savings vs. individual items" },
              { value: "2", label: "Options per tier — no paralysis" },
              { value: "100%", label: "Compatibility guaranteed" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-5xl font-semibold tracking-tight">{stat.value}</dt>
                <dd className="mt-2 text-sm text-muted-foreground">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Not sure which tier?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Take our quick quiz for personalised recommendations, or book a free
              consultation with our creator experts.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Button size="lg" asChild>
                <Link to="/quiz">
                  Take the quiz
                  <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/consultations">Book a free consultation</Link>
              </Button>
            </div>

            <p className="mt-8 text-sm text-muted-foreground">
              Prefer to browse individual items?{" "}
              <Link to="/shop" className="font-medium text-primary hover:underline underline-offset-4">
                Visit the shop
              </Link>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Packages;
