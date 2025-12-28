import { Link } from "react-router-dom";
import { Coins, Sparkles, TrendingUp, Gift, Percent } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/constants";

interface CoinBenefitsBannerProps {
  productPriceNaira?: number;
  productPriceCoins?: number;
  variant?: "inline" | "card" | "compact";
}

const CoinBenefitsBanner = ({ 
  productPriceNaira, 
  productPriceCoins,
  variant = "card" 
}: CoinBenefitsBannerProps) => {
  // Calculate savings based on coin package bonuses - best-deal package has 30% bonus
  const bonusPercent = 30;
  
  // Best deal package: 20000 naira = 2600 coins (0.13 coins per naira)
  const coinsPerNaira = 0.13;
  
  // If product prices provided, calculate specific savings
  let savings = 0;
  let savingsPercent = 0;
  
  if (productPriceNaira && productPriceCoins) {
    // How much naira would it cost to buy the required coins with best package?
    const nairaNeededForCoins = productPriceCoins / coinsPerNaira;
    savings = productPriceNaira - nairaNeededForCoins;
    savingsPercent = Math.round((savings / productPriceNaira) * 100);
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-coin/10 to-primary/10 border border-coin/20">
        <Coins className="h-4 w-4 text-coin shrink-0" />
        <span className="text-xs text-foreground">
          <span className="font-medium">Save up to {bonusPercent}%</span> when paying with coins
        </span>
        <Link to="/buy-coins" className="text-xs text-primary font-medium hover:underline ml-auto">
          Get Coins
        </Link>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-coin/10 via-background to-primary/10 border border-coin/30">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coin/20">
          <Coins className="h-5 w-5 text-coin" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {savingsPercent > 0 ? (
              <>Save {formatNaira(Math.round(savings))} ({savingsPercent}%) with coins!</>
            ) : (
              <>Save up to {bonusPercent}% with coins</>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            Buy coins in bulk for bonus rewards
          </p>
        </div>
        <Button size="sm" variant="outline" className="shrink-0 border-coin/50 text-coin hover:bg-coin/10" asChild>
          <Link to="/buy-coins">Buy Coins</Link>
        </Button>
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card className="bg-gradient-to-br from-coin/5 via-background to-primary/5 border-coin/30 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-coin to-coin/80 text-coin-foreground shadow-lg">
            <Coins className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground">Why Pay with Coins?</h3>
              <Badge className="bg-coin/20 text-coin border-coin/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Smart Savings
              </Badge>
            </div>
            
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-coin" />
                <span>Get up to <strong className="text-foreground">{bonusPercent}% bonus coins</strong> on bulk purchases</span>
              </li>
              <li className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-coin" />
                <span>Exclusive <strong className="text-foreground">coin-only discounts</strong> on select items</span>
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-coin" />
                <span>Coins <strong className="text-foreground">never expire</strong> - use anytime</span>
              </li>
            </ul>

            {savingsPercent > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 mb-4">
                <span className="text-sm text-emerald-600 font-medium">
                  💰 You could save {formatNaira(Math.round(savings))} on this purchase!
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button className="gap-2 bg-coin hover:bg-coin/90 text-coin-foreground" asChild>
                <Link to="/buy-coins">
                  <Coins className="h-4 w-4" />
                  Buy Coins Now
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/buy-coins">See Coin Packages</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoinBenefitsBanner;
