import { Link } from "react-router-dom";
import { Coins, Gift, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COIN_PACKAGES } from "@/lib/constants";

const benefits = [
  {
    icon: Gift,
    title: "Bonus Coins",
    description: "Get up to 20% extra coins when you buy in bulk",
  },
  {
    icon: Zap,
    title: "Instant Checkout",
    description: "Skip payment hassle - just click and buy with coins",
  },
  {
    icon: Shield,
    title: "Never Expire",
    description: "Your coins stay valid forever, no rush to spend",
  },
];

const CoinSystem = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <Badge variant="outline" className="mb-4">
              <Coins className="h-3 w-3 mr-1 text-coin" />
              Coin System
            </Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              Buy Coins.{" "}
              <span className="bg-gradient-to-r from-coin to-primary bg-clip-text text-transparent">
                Get More Value.
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our coin system rewards bulk purchases with bonus value. 
              The more you buy, the more you save on premium equipment.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button size="lg" className="gap-2" asChild>
              <Link to="/coins">
                <Coins className="h-4 w-4" />
                Buy Coins Now
              </Link>
            </Button>
          </div>

          {/* Right - Coin Packages */}
          <div className="relative">
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-coin/20 via-primary/10 to-accent/20 rounded-3xl blur-3xl" />
            
            <div className="relative grid grid-cols-2 gap-4">
              {COIN_PACKAGES.map((pkg, index) => (
                <div
                  key={pkg.name}
                  className={`rounded-2xl border border-border bg-background/80 backdrop-blur-sm p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/30 ${
                    index === COIN_PACKAGES.length - 1 ? "ring-2 ring-primary" : ""
                  }`}
                >
                  {pkg.bonus > 0 && (
                    <Badge className="mb-2 bg-coin/10 text-coin border-coin/30">
                      +{pkg.bonus}% Bonus
                    </Badge>
                  )}
                  <h3 className="font-semibold text-foreground text-lg mb-1">
                    {pkg.name}
                  </h3>
                <p className="text-2xl font-bold text-foreground mb-1">
                    ₦{pkg.naira.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Coins className="h-4 w-4 text-coin" />
                    <span className="text-sm">
                      {pkg.coins.toLocaleString()} coins
                      {pkg.bonus > 0 && (
                        <span className="text-coin ml-1">
                          (+{Math.round(pkg.coins * (pkg.bonus / 100))})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoinSystem;
