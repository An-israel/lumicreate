import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import brandPattern from "@/assets/brand-pattern.png";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 py-16 md:py-24 lg:py-32">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
        {/* Brand Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url(${brandPattern})`,
            backgroundSize: '120px',
            backgroundRepeat: 'repeat',
          }}
        />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm backdrop-blur-sm animate-fade-in">
            <Sparkles className="h-4 w-4 text-coin" />
            <span className="text-muted-foreground">Trusted by 500+ Nigerian creators</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Your Content.{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Elevated.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl md:text-2xl max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Curated equipment packages designed specifically for Nigerian content creators. 
            From beginner to pro, we've got your setup covered.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button size="lg" className="w-full sm:w-auto gap-2 text-base" asChild>
              <Link to="/quiz">
                Find My Equipment
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-base" asChild>
              <Link to="/packages">
                <Play className="h-4 w-4" />
                Browse Packages
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
              <span className="text-sm">500+ creators</span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="text-coin">★</span>
                ))}
              </div>
              <span className="text-sm">4.9/5 rating</span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="text-sm">
              <span className="font-semibold text-foreground">24hr</span> Lagos delivery
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
