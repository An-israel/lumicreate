import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/useProducts";
import { formatNaira, formatCoins, TIERS } from "@/lib/constants";
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  Package, 
  Star,
  Zap,
  Crown,
  ShoppingCart,
  Coins
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
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

const Packages = () => {
  const { products, isLoading } = useProducts({ isPackage: true });
  const { addToCart } = useCart();

  // Group packages by tier
  const packagesByTier = {
    basic: products.filter(p => p.tier === "basic"),
    premium: products.filter(p => p.tier === "premium"),
    diamond: products.filter(p => p.tier === "diamond"),
  };

  const tierOrder = ["basic", "premium", "diamond"] as const;

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    await addToCart(productId);
  };

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

            <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto mb-8">
              Pre-built equipment bundles designed for every creator level. 
              Save up to 25% compared to buying items individually.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {tierOrder.map((tier) => {
                const TierIcon = tierIcons[tier];
                return (
                  <a
                    key={tier}
                    href={`#${tier}`}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full border transition-all",
                      tierBorderColors[tier],
                      tierBgColors[tier]
                    )}
                  >
                    <TierIcon className="h-4 w-4" />
                    <span className="font-medium capitalize">{tier}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Tier Comparison */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6">
            {tierOrder.map((tier) => {
              const tierInfo = TIERS[tier];
              const TierIcon = tierIcons[tier];
              const isPremium = tier === "premium";
              
              return (
                <Card 
                  key={tier} 
                  className={cn(
                    "relative overflow-hidden transition-all",
                    tierBorderColors[tier],
                    isPremium && "ring-2 ring-primary/50 scale-[1.02]"
                  )}
                >
                  {isPremium && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className={cn("text-center pb-4", tierBgColors[tier])}>
                    <div className={cn(
                      "w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4 bg-gradient-to-br",
                      tierGradients[tier]
                    )}>
                      <TierIcon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold capitalize">{tierInfo.name}</h3>
                    <p className="text-sm text-muted-foreground">{tierInfo.priceRange}</p>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground mb-4 text-center">
                      {tierInfo.perfectFor}
                    </p>
                    <div className="text-center">
                      <a href={`#${tier}`}>
                        <Button variant={isPremium ? "default" : "outline"} className="gap-2">
                          View {tierInfo.name} Packages
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Package Listings by Tier */}
      {tierOrder.map((tier) => {
        const tierInfo = TIERS[tier];
        const TierIcon = tierIcons[tier];
        const packages = packagesByTier[tier];

        return (
          <section 
            key={tier} 
            id={tier} 
            className={cn("py-16 md:py-24", tier === "premium" && "bg-muted/30")}
          >
            <div className="container">
              {/* Tier Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br",
                  tierGradients[tier]
                )}>
                  <TierIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold capitalize">{tierInfo.name} Packages</h2>
                  <p className="text-muted-foreground">{tierInfo.priceRange}</p>
                </div>
              </div>

              {/* Packages Grid */}
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-video w-full" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              ) : packages.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {packages.map((pkg) => {
                    const savings = pkg.original_price_naira 
                      ? pkg.original_price_naira - pkg.price_naira 
                      : 0;
                    const savingsPercent = pkg.original_price_naira 
                      ? Math.round((savings / pkg.original_price_naira) * 100) 
                      : 0;

                    return (
                      <Card 
                        key={pkg.id} 
                        className={cn(
                          "group overflow-hidden transition-all hover:shadow-lg",
                          tierBorderColors[tier]
                        )}
                      >
                        {/* Image */}
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          {pkg.image_url ? (
                            <img
                              src={pkg.image_url}
                              alt={pkg.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-12 w-12 text-muted-foreground/50" />
                            </div>
                          )}
                          
                          {/* Savings Badge */}
                          {savingsPercent > 0 && (
                            <Badge className="absolute top-3 right-3 bg-green-500 hover:bg-green-600">
                              Save {savingsPercent}%
                            </Badge>
                          )}
                        </div>

                        <CardContent className="p-5">
                          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{pkg.name}</h3>
                          
                          {pkg.description && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {pkg.description}
                            </p>
                          )}

                          {/* Package Contents Preview */}
                          {pkg.specifications && Object.keys(pkg.specifications).length > 0 && (
                            <div className="mb-4 space-y-1">
                              {Object.entries(pkg.specifications).slice(0, 4).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2 text-sm">
                                  <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                  <span className="text-muted-foreground truncate">{String(value)}</span>
                                </div>
                              ))}
                              {Object.keys(pkg.specifications).length > 4 && (
                                <p className="text-xs text-muted-foreground pl-5">
                                  +{Object.keys(pkg.specifications).length - 4} more items
                                </p>
                              )}
                            </div>
                          )}

                          {/* Pricing */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold">{formatNaira(pkg.price_naira)}</span>
                              {pkg.original_price_naira && pkg.original_price_naira > pkg.price_naira && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatNaira(pkg.original_price_naira)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Coins className="h-4 w-4 text-coin" />
                              <span>{formatCoins(pkg.price_coins)} coins</span>
                            </div>
                            {savings > 0 && (
                              <p className="text-sm text-green-600 font-medium">
                                You save {formatNaira(savings)}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Link to={`/product/${pkg.id}`} className="flex-1">
                              <Button variant="outline" className="w-full">
                                View Details
                              </Button>
                            </Link>
                            <Button 
                              onClick={(e) => handleAddToCart(pkg.id, e)}
                              disabled={!pkg.in_stock}
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/50 rounded-lg border border-dashed border-border">
                  <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No {tierInfo.name} Packages Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Check back soon for curated {tierInfo.name.toLowerCase()} bundles.
                  </p>
                  <Link to="/shop">
                    <Button variant="outline">Browse Individual Products</Button>
                  </Link>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Not Sure Which Package?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Book a free consultation with our creator experts to find the perfect setup for your needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/consultations">
                <Button size="lg" className="gap-2">
                  Book Free Consultation
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/shop">
                <Button size="lg" variant="outline">
                  Browse Individual Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Packages;
