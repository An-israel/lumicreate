import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Coins, Check, Sparkles, Zap, Crown, Star } from "lucide-react";
import { COIN_PACKAGES, formatNaira, formatCoins } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function BuyCoins() {
  const { user, wallet, refreshWallet } = useAuth();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      toast.error("Please sign in to purchase coins");
      navigate("/auth");
      return;
    }

    const pkg = COIN_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) return;

    setIsProcessing(true);
    setSelectedPackage(packageId);

    // TODO: Integrate with Paystack
    // For now, show a message that Paystack integration is pending
    toast.info("Paystack integration coming soon! Coins will be added after payment.");
    
    setIsProcessing(false);
    setSelectedPackage(null);
  };

  const getPackageIcon = (id: string) => {
    switch (id) {
      case "starter":
        return Coins;
      case "popular":
        return Zap;
      case "value":
        return Star;
      case "best-deal":
        return Crown;
      default:
        return Coins;
    }
  };

  return (
    <Layout>
      <div className="container-main py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-secondary text-secondary-foreground">
            <Sparkles className="h-3 w-3 mr-1" />
            Best Value
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Buy <span className="text-gradient">Luminate Coins</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Purchase coins to unlock exclusive discounts on equipment and consultations.
            The more you buy, the more bonus coins you receive!
          </p>

          {/* Current Balance */}
          {user && (
            <div className="mt-8 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card border border-border">
              <Coins className="h-6 w-6 text-secondary" />
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Your Balance</p>
                <p className="text-2xl font-bold">{formatCoins(wallet?.balance || 0)} coins</p>
              </div>
            </div>
          )}
        </div>

        {/* Coin Packages */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {COIN_PACKAGES.map((pkg) => {
            const Icon = getPackageIcon(pkg.id);
            const isSelected = selectedPackage === pkg.id;
            const isPopular = "popular" in pkg && pkg.popular;
            const isBestValue = "bestValue" in pkg && pkg.bestValue;

            return (
              <Card
                key={pkg.id}
                className={cn(
                  "relative overflow-hidden transition-all duration-300 card-hover cursor-pointer",
                  isPopular && "border-primary shadow-lg",
                  isBestValue && "border-secondary shadow-lg",
                  isSelected && "ring-2 ring-primary"
                )}
                onClick={() => handlePurchase(pkg.id)}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                {isBestValue && (
                  <div className="absolute top-0 right-0 bg-secondary text-secondary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg">
                    BEST VALUE
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div
                    className={cn(
                      "mx-auto p-4 rounded-full mb-4",
                      isPopular
                        ? "bg-primary/10"
                        : isBestValue
                        ? "bg-secondary/20"
                        : "bg-muted"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-8 w-8",
                        isPopular
                          ? "text-primary"
                          : isBestValue
                          ? "text-secondary"
                          : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>

                <CardContent className="text-center space-y-4">
                  <div>
                    <p className="text-3xl font-bold">{formatNaira(pkg.naira)}</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-lg font-semibold">{formatCoins(pkg.coins)} coins</span>
                      {pkg.bonus > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          +{formatCoins(pkg.bonus)} bonus
                        </Badge>
                      )}
                    </div>
                  </div>

                  {pkg.bonus > 0 && (
                    <div className="flex items-center justify-center gap-2 text-sm text-success">
                      <Check className="h-4 w-4" />
                      <span>{"bonusPercent" in pkg ? `${pkg.bonusPercent}%` : ""} extra coins!</span>
                    </div>
                  )}

                  <Button
                    className={cn(
                      "w-full",
                      isPopular && "gradient-primary",
                      isBestValue && "gradient-secondary text-secondary-foreground"
                    )}
                    disabled={isProcessing}
                  >
                    {isProcessing && isSelected ? "Processing..." : "Buy Now"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Why Buy Coins?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Instant Savings</h3>
                <p className="text-sm text-muted-foreground">
                  Save up to 30% on all equipment and consultations when paying with coins
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="p-3 rounded-full bg-secondary/20 w-fit mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold mb-2">Bonus Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Get up to 30% bonus coins when you buy larger packages
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="p-3 rounded-full bg-accent/10 w-fit mx-auto mb-4">
                  <Crown className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Never Expire</h3>
                <p className="text-sm text-muted-foreground">
                  Your coins never expire, use them whenever you're ready
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Not logged in CTA */}
        {!user && (
          <div className="mt-12 text-center">
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  Sign in or create an account to start purchasing coins
                </p>
                <Button onClick={() => navigate("/auth")}>
                  Sign In to Continue
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
