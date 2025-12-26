import { Link } from "react-router-dom";
import { Check, Sparkles, Crown, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const tiers = [
  {
    name: "Basic",
    icon: Sparkles,
    description: "Perfect for beginners starting their content journey",
    priceRange: "₦15,000 - ₦50,000",
    coinRange: "1,500 - 5,000",
    features: [
      "Ring lights & basic lighting",
      "Smartphone tripods",
      "Clip-on lapel mics",
      "Basic backdrops",
      "Entry-level accessories",
    ],
    color: "from-emerald-500 to-teal-500",
    borderColor: "border-emerald-500/30",
    badgeColor: "bg-emerald-500/10 text-emerald-500",
    popular: false,
  },
  {
    name: "Premium",
    icon: Crown,
    description: "For creators ready to level up their production quality",
    priceRange: "₦50,000 - ₦200,000",
    coinRange: "5,000 - 20,000",
    features: [
      "LED panel lighting systems",
      "USB condenser microphones",
      "HD webcams & capture cards",
      "Boom arms & shock mounts",
      "Professional backdrops",
      "Acoustic treatment basics",
    ],
    color: "from-primary to-accent",
    borderColor: "border-primary/30",
    badgeColor: "bg-primary/10 text-primary",
    popular: true,
  },
  {
    name: "Diamond",
    icon: Gem,
    description: "Professional-grade equipment for serious creators",
    priceRange: "₦200,000+",
    coinRange: "20,000+",
    features: [
      "Softbox & studio lighting",
      "XLR microphone setups",
      "Audio interfaces & mixers",
      "Camera options (DSLR ready)",
      "Complete studio packages",
      "Priority support & setup help",
    ],
    color: "from-violet-500 to-purple-500",
    borderColor: "border-violet-500/30",
    badgeColor: "bg-violet-500/10 text-violet-500",
    popular: false,
  },
];

const PackageTiers = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Equipment Packages
          </Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl mb-4">
            Choose Your Tier
          </h2>
          <p className="text-lg text-muted-foreground">
            Curated packages designed for every stage of your creator journey. 
            All equipment is carefully selected for Nigerian creators.
          </p>
        </div>

        {/* Tier Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${tier.borderColor} ${
                tier.popular ? "border-2 scale-[1.02] shadow-lg" : "border"
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0">
                  <div className={`bg-gradient-to-r ${tier.color} text-white text-xs font-semibold px-3 py-1 rounded-bl-lg`}>
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tier.color} text-white mb-4`}>
                  <tier.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-display">{tier.name}</CardTitle>
                <CardDescription className="text-base">{tier.description}</CardDescription>
              </CardHeader>

              <CardContent className="pb-4">
                <div className="mb-6">
                  <p className="text-2xl font-bold text-foreground">{tier.priceRange}</p>
                  <p className="text-sm text-muted-foreground">
                    or {tier.coinRange} coins
                  </p>
                </div>

                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className={`h-5 w-5 shrink-0 mt-0.5 bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`} />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full ${tier.popular ? `bg-gradient-to-r ${tier.color} hover:opacity-90` : ""}`}
                  variant={tier.popular ? "default" : "outline"}
                  asChild
                >
                  <Link to={`/packages?tier=${tier.name.toLowerCase()}`}>
                    Browse {tier.name} Packages
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Not sure which tier is right for you?
          </p>
          <Button variant="link" className="gap-2" asChild>
            <Link to="/quiz">
              Take the 2-minute equipment quiz
              <Sparkles className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PackageTiers;
