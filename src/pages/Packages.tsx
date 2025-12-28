import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TIERS } from "@/lib/constants";
import { 
  Sparkles, 
  ArrowRight, 
  Star,
  Zap,
  Crown,
  Check,
  Lightbulb,
  Mic
} from "lucide-react";
import { cn } from "@/lib/utils";

const tierIcons = {
  basic: Zap,
  premium: Star,
  diamond: Crown,
};

const tierGradients = {
  basic: "from-emerald-500 to-teal-500",
  premium: "from-primary to-accent",
  diamond: "from-violet-500 to-purple-500",
};

const tierBorderColors = {
  basic: "border-emerald-500/30 hover:border-emerald-500/50",
  premium: "border-primary/30 hover:border-primary/50",
  diamond: "border-violet-500/30 hover:border-violet-500/50",
};

const tierBgColors = {
  basic: "bg-emerald-500/5",
  premium: "bg-primary/5",
  diamond: "bg-violet-500/5",
};

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
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 py-16 md:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-muted-foreground">Curated Equipment Bundles</span>
            </div>

            <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Creator{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Packages
              </span>
            </h1>

            <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto mb-4">
              Choose your tier. Each tier has just 2 carefully curated packages — 
              no decision paralysis, just clear choices.
            </p>
            
            <p className="text-muted-foreground mb-8">
              Save up to 25% compared to buying items individually.
            </p>
          </div>
        </div>
      </section>

      {/* Tier Selection Cards */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Select Your Level
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Each tier is designed for a specific creator journey. Pick the one that matches where you are now.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {tierOrder.map((tier) => {
              const tierInfo = TIERS[tier];
              const TierIcon = tierIcons[tier];
              const details = tierDetails[tier];
              const isPremium = tier === "premium";
              
              return (
                <Link key={tier} to={`/packages/${tier}`}>
                  <Card 
                    className={cn(
                      "relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 h-full",
                      tierBorderColors[tier],
                      isPremium && "ring-2 ring-primary/50 md:scale-105"
                    )}
                  >
                    {isPremium && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                        Most Popular
                      </div>
                    )}
                    
                    <CardHeader className={cn("text-center pb-4", tierBgColors[tier])}>
                      <div className={cn(
                        "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br shadow-lg",
                        tierGradients[tier]
                      )}>
                        <TierIcon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold capitalize">{tierInfo.name}</h3>
                      <p className="text-lg font-medium text-muted-foreground">{tierInfo.priceRange}</p>
                    </CardHeader>
                    
                    <CardContent className="pt-6 space-y-6">
                      <p className="text-sm text-muted-foreground text-center">
                        {tierInfo.perfectFor}
                      </p>

                      {/* Package Count */}
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold">{details.packages}</p>
                        <p className="text-sm text-muted-foreground">Curated Packages</p>
                      </div>

                      {/* Lighting */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Lightbulb className="h-4 w-4 text-amber-500" />
                          Lighting
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">
                          {details.lights}
                        </p>
                      </div>

                      {/* Audio */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Mic className="h-4 w-4 text-blue-500" />
                          Audio
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">
                          {details.audio}
                        </p>
                      </div>

                      {/* Features */}
                      <div className="space-y-2">
                        {details.features.slice(0, 4).map((feature, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                        {details.features.length > 4 && (
                          <p className="text-sm text-muted-foreground pl-6">
                            +{details.features.length - 4} more included
                          </p>
                        )}
                      </div>

                      {/* CTA */}
                      <Button className={cn("w-full gap-2", isPremium ? "" : "")}>
                        View {tierInfo.name} Packages
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Packages */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Why Choose a Package?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We've done the research so you don't have to. Each package is assembled by 
              experienced creators who know exactly what works together.
            </p>
            
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              <div className="p-6 rounded-lg bg-background border border-border">
                <div className="text-3xl font-bold text-primary mb-2">25%</div>
                <p className="text-sm text-muted-foreground">Average savings vs. individual items</p>
              </div>
              <div className="p-6 rounded-lg bg-background border border-border">
                <div className="text-3xl font-bold text-primary mb-2">2</div>
                <p className="text-sm text-muted-foreground">Options per tier — no paralysis</p>
              </div>
              <div className="p-6 rounded-lg bg-background border border-border">
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <p className="text-sm text-muted-foreground">Compatibility guaranteed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Not Sure Which Tier?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Take our quick quiz to get personalized recommendations, or book a free 
              consultation with our creator experts.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/quiz">
                <Button size="lg" className="gap-2">
                  Take the Quiz
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/consultations">
                <Button size="lg" variant="outline">
                  Book Free Consultation
                </Button>
              </Link>
            </div>
            
            <p className="mt-8 text-muted-foreground">
              Prefer to browse individual items?{" "}
              <Link to="/shop" className="text-primary hover:underline">
                Visit the Shop →
              </Link>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Packages;
