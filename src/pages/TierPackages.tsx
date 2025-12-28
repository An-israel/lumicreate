import { useParams, Link, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/useProducts";
import { formatNaira, formatCoins, TIERS } from "@/lib/constants";
import { 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Package, 
  Star,
  Zap,
  Crown,
  ShoppingCart,
  Coins,
  Lightbulb,
  Mic,
  Camera
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { ProductTier } from "@/types/database";

const tierConfig = {
  basic: {
    icon: Zap,
    gradient: "from-emerald-500 to-teal-500",
    borderColor: "border-emerald-500/30 hover:border-emerald-500/50",
    bgColor: "bg-emerald-500/5",
    accentColor: "text-emerald-500",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    heroGradient: "from-emerald-500/20 via-background to-teal-500/10",
    description: "Perfect for smartphone creators, TikTokers, and Instagram content creators just getting started. These packages include the essentials to dramatically improve your content quality without overwhelming complexity.",
    idealFor: [
      "TikTok and Instagram Reels creators",
      "Smartphone-first content creation",
      "Beginners building their first setup",
      "Budget-conscious creators"
    ],
    lightingGuide: "Basic packages include 2-3 lights: a key light for main illumination, plus fill or background lighting for dimension.",
  },
  premium: {
    icon: Star,
    gradient: "from-primary to-accent",
    borderColor: "border-primary/30 hover:border-primary/50",
    bgColor: "bg-primary/5",
    accentColor: "text-primary",
    badgeColor: "bg-primary/10 text-primary border-primary/30",
    heroGradient: "from-primary/20 via-background to-accent/10",
    description: "For YouTubers, podcasters, and serious content creators ready to upgrade their quality. These setups deliver professional results that compete with established channels.",
    idealFor: [
      "YouTubers building their channel",
      "Podcasters seeking broadcast quality",
      "Educators and course creators",
      "Live streamers going pro"
    ],
    lightingGuide: "Premium packages include 3-4 lights: key light, fill light, background light, plus optional rim lighting for cinematic depth.",
  },
  diamond: {
    icon: Crown,
    gradient: "from-violet-500 to-purple-500",
    borderColor: "border-violet-500/30 hover:border-violet-500/50",
    bgColor: "bg-violet-500/5",
    accentColor: "text-violet-500",
    badgeColor: "bg-violet-500/10 text-violet-500 border-violet-500/30",
    heroGradient: "from-violet-500/20 via-background to-purple-500/10",
    description: "The definitive setups for professional creators, brand partnerships, and commercial production. These are the tools used by full-time content professionals and small production studios.",
    idealFor: [
      "Full-time professional creators",
      "Brand partnership content",
      "Commercial video production",
      "Multi-platform content studios"
    ],
    lightingGuide: "Diamond packages include full 5-point lighting: key, fill, background, rim, and practical/accent lights for cinema-quality productions.",
  },
};

const TierPackages = () => {
  const { tier } = useParams<{ tier: string }>();
  const validTier = tier as ProductTier;
  
  // Validate tier
  if (!tier || !["basic", "premium", "diamond"].includes(tier)) {
    return <Navigate to="/packages" replace />;
  }

  const { products, isLoading } = useProducts({ isPackage: true, tier: validTier });
  const { addToCart } = useCart();
  
  const config = tierConfig[validTier];
  const tierInfo = TIERS[validTier];
  const TierIcon = config.icon;

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    await addToCart(productId);
  };

  const otherTiers = Object.entries(tierConfig).filter(([key]) => key !== tier);

  return (
    <Layout>
      {/* Hero Section */}
      <section className={cn("relative overflow-hidden py-16 md:py-24 bg-gradient-to-br", config.heroGradient)}>
        <div className="absolute inset-0 overflow-hidden">
          <div className={cn("absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl", config.bgColor)} />
          <div className={cn("absolute -bottom-40 -left-40 h-80 w-80 rounded-full blur-3xl", config.bgColor)} />
        </div>

        <div className="container relative">
          <Link to="/packages" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            All Packages
          </Link>

          <div className="flex items-start gap-6 mb-8">
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg",
              config.gradient
            )}>
              <TierIcon className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-2">
                {tierInfo.name} Packages
              </h1>
              <p className="text-xl text-muted-foreground">
                {tierInfo.priceRange}
              </p>
            </div>
          </div>

          <p className="text-lg text-muted-foreground max-w-3xl mb-8">
            {config.description}
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Ideal For */}
            <Card className={cn("border", config.borderColor)}>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Check className={cn("h-5 w-5", config.accentColor)} />
                  Ideal For
                </h3>
                <ul className="space-y-2">
                  {config.idealFor.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <div className={cn("h-1.5 w-1.5 rounded-full", config.gradient.includes("emerald") ? "bg-emerald-500" : config.gradient.includes("primary") ? "bg-primary" : "bg-violet-500")} />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Lighting Guide */}
            <Card className={cn("border", config.borderColor)}>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className={cn("h-5 w-5", config.accentColor)} />
                  What's Included - Lighting
                </h3>
                <p className="text-muted-foreground">
                  {config.lightingGuide}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8">
            Choose Your {tierInfo.name} Package
          </h2>

          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-video w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2">
              {products.map((pkg, index) => {
                const savings = pkg.original_price_naira 
                  ? pkg.original_price_naira - pkg.price_naira 
                  : 0;
                const savingsPercent = pkg.original_price_naira 
                  ? Math.round((savings / pkg.original_price_naira) * 100) 
                  : 0;
                const specs = pkg.specifications as Record<string, string>;

                return (
                  <Card 
                    key={pkg.id} 
                    className={cn(
                      "group overflow-hidden transition-all hover:shadow-xl",
                      config.borderColor,
                      index === 0 && "ring-2 ring-offset-2 ring-offset-background",
                      index === 0 && (validTier === "basic" ? "ring-emerald-500/50" : validTier === "premium" ? "ring-primary/50" : "ring-violet-500/50")
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
                          <Package className="h-16 w-16 text-muted-foreground/50" />
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className={config.badgeColor}>
                          {tierInfo.name}
                        </Badge>
                        {index === 0 && (
                          <Badge className="bg-accent text-accent-foreground">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      
                      {savingsPercent > 0 && (
                        <Badge className="absolute top-4 right-4 bg-green-500 hover:bg-green-600">
                          Save {savingsPercent}%
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-2xl font-bold mb-3">{pkg.name}</h3>
                      
                      {pkg.description && (
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                          {pkg.description}
                        </p>
                      )}

                      {/* What's Included */}
                      {specs && Object.keys(specs).length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            What's Included
                          </h4>
                          <div className="grid gap-2">
                            {Object.entries(specs)
                              .filter(([key]) => !["Best For", "Included Items"].includes(key))
                              .map(([key, value]) => (
                                <div key={key} className="flex items-start gap-3 text-sm">
                                  <Check className={cn("h-4 w-4 mt-0.5 flex-shrink-0", config.accentColor)} />
                                  <div>
                                    <span className="font-medium">{key}:</span>{" "}
                                    <span className="text-muted-foreground">{value}</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Best For */}
                      {specs?.["Best For"] && (
                        <div className={cn("p-3 rounded-lg mb-6", config.bgColor)}>
                          <p className="text-sm">
                            <span className="font-medium">Best For:</span>{" "}
                            <span className="text-muted-foreground">{specs["Best For"]}</span>
                          </p>
                        </div>
                      )}

                      {/* Pricing */}
                      <div className="space-y-3 mb-6 p-4 rounded-lg bg-muted/50">
                        <div className="flex items-baseline justify-between">
                          <span className="text-3xl font-bold">{formatNaira(pkg.price_naira)}</span>
                          {pkg.original_price_naira && pkg.original_price_naira > pkg.price_naira && (
                            <span className="text-lg text-muted-foreground line-through">
                              {formatNaira(pkg.original_price_naira)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Coins className="h-5 w-5 text-coin" />
                          <span className="text-lg">{formatCoins(pkg.price_coins)} coins</span>
                        </div>
                        {savings > 0 && (
                          <p className="text-green-600 font-semibold">
                            You save {formatNaira(savings)} with this bundle!
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Link to={`/product/${pkg.id}`} className="flex-1">
                          <Button variant="outline" className="w-full gap-2">
                            View Full Details
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          className="gap-2 px-6"
                          onClick={(e) => handleAddToCart(pkg.id, e)}
                          disabled={!pkg.in_stock}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add to Cart
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
              <h3 className="text-lg font-semibold mb-2">No {tierInfo.name} Packages Available</h3>
              <p className="text-muted-foreground mb-4">
                Check back soon for curated {tierInfo.name.toLowerCase()} bundles.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Other Tiers */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Explore Other Tiers
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {otherTiers.map(([key, otherConfig]) => {
              const otherTierInfo = TIERS[key as ProductTier];
              const OtherIcon = otherConfig.icon;
              
              return (
                <Link key={key} to={`/packages/${key}`}>
                  <Card className={cn(
                    "h-full transition-all hover:shadow-lg",
                    otherConfig.borderColor
                  )}>
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br flex-shrink-0",
                        otherConfig.gradient
                      )}>
                        <OtherIcon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{otherTierInfo.name} Packages</h3>
                        <p className="text-sm text-muted-foreground">{otherTierInfo.priceRange}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 ml-auto text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Need Help Choosing?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Not sure which package is right for you? Book a free consultation with our creator experts.
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

export default TierPackages;
