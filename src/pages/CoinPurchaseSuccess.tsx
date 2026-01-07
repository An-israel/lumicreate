import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, CheckCircle, ShoppingBag, LayoutDashboard, Sparkles } from "lucide-react";
import { formatCoins } from "@/lib/constants";
import confetti from "canvas-confetti";
import brandPattern from "@/assets/brand-pattern.png";

export default function CoinPurchaseSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { wallet, refreshWallet, user } = useAuth();
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  const coinsAdded = parseInt(searchParams.get("coins") || "0");
  const bonusCoins = parseInt(searchParams.get("bonus") || "0");
  const newBalance = wallet?.balance || 0;

  useEffect(() => {
    refreshWallet();
    
    // Trigger confetti celebration
    if (!hasTriggeredConfetti && coinsAdded > 0) {
      setHasTriggeredConfetti(true);
      
      // Initial burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FFFF00', '#00E5FF', '#0066FF'],
      });

      // Coin-colored confetti
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FFD700', '#FFA500'],
        });
      }, 250);

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FFD700', '#FFA500'],
        });
      }, 400);
    }
  }, [coinsAdded, hasTriggeredConfetti, refreshWallet]);

  return (
    <Layout>
      <div 
        className="min-h-[80vh] flex items-center justify-center py-12 relative overflow-hidden"
        style={{
          backgroundImage: `url(${brandPattern})`,
          backgroundSize: '200px',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-background/95" />
        
        <div className="container-main relative z-10">
          <Card className="max-w-lg mx-auto glass">
            <CardContent className="pt-12 pb-10 text-center space-y-6">
              {/* Success Icon */}
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-secondary to-coin animate-pulse-slow" />
                <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-secondary" />
                </div>
              </div>

              {/* Main Message */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Thank You!</h1>
                <p className="text-muted-foreground text-lg">
                  Your coin purchase was successful
                </p>
              </div>

              {/* Coins Summary */}
              <div className="bg-muted/50 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <Coins className="h-8 w-8 text-coin" />
                  <span className="text-4xl font-bold text-coin">
                    +{formatCoins(coinsAdded + bonusCoins)}
                  </span>
                </div>
                
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between px-4">
                    <span className="text-muted-foreground">Base Coins</span>
                    <span className="font-medium">{formatCoins(coinsAdded)}</span>
                  </div>
                  {bonusCoins > 0 && (
                    <div className="flex justify-between px-4">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-secondary" />
                        Bonus Coins
                      </span>
                      <span className="font-medium text-secondary">+{formatCoins(bonusCoins)}</span>
                    </div>
                  )}
                </div>

                <hr className="border-border" />

                <div className="flex justify-between items-center px-4">
                  <span className="font-semibold">New Balance</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCoins(newBalance)} coins
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button size="lg" className="flex-1 gap-2" asChild>
                  <Link to="/shop">
                    <ShoppingBag className="h-5 w-5" />
                    Start Shopping
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="flex-1 gap-2" asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-5 w-5" />
                    View Dashboard
                  </Link>
                </Button>
              </div>

              {/* Email Confirmation */}
              {user?.email && (
                <p className="text-sm text-muted-foreground">
                  A receipt has been sent to <span className="font-medium">{user.email}</span>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
