import { useParams, Link, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/useProducts";
import { formatNaira, TIERS } from "@/lib/constants";
import { Check, ArrowRight, ArrowLeft, Package, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { ProductTier } from "@/types/database";

const tierConfig = {
  basic: {
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

const isProductTier = (value?: string): value is ProductTier =>
  !!value && ["basic", "premium", "diamond"].includes(value);

const TierPackages = () => {
  const { tier } = useParams<{ tier: string }>();
  const validTier: ProductTier = isProductTier(tier) ? tier : "basic";

  const { products, isLoading } = useProducts({ isPackage: true, tier: validTier });
  const { addToCart } = useCart();

  if (!isProductTier(tier)) {
    return <Navigate to="/packages" replace />;
  }

  const config = tierConfig[validTier];
  const tierInfo = TIERS[validTier];

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    await addToCart(productId);
  };

  const otherTiers = Object.keys(tierConfig).filter((key) => key !== tier) as ProductTier[];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="border-b border-border pt-10 pb-16 md:pt-14 md:pb-20">
        <div className="container">
          <Link to="/packages" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            All packages
          </Link>

          <div className="mt-10 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="eyebrow mb-4">{tierInfo.priceRange}</p>
              <h1 className="font-serif-display text-5xl text-foreground sm:text-6xl md:text-7xl">
                {tierInfo.name} packages
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
                {config.description}
              </p>
            </div>

            <div className="space-y-8 lg:col-span-5 lg:border-l lg:border-border lg:pl-12">
              <div>
                <h3 className="text-sm font-medium">Ideal for</h3>
                <ul className="mt-3 space-y-2">
                  {config.idealFor.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-muted-foreground">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-brand" strokeWidth={2.5} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium">Lighting</h3>
                <p className="mt-3 text-muted-foreground">{config.lightingGuide}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="section">
        <div className="container">
          <h2 className="mb-10 text-3xl font-semibold tracking-tight">
            Choose your {tierInfo.name.toLowerCase()} package
          </h2>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-video w-full rounded-2xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {products.map((pkg, index) => {
                const savings = pkg.original_price_naira
                  ? pkg.original_price_naira - pkg.price_naira
                  : 0;
                const savingsPercent = pkg.original_price_naira
                  ? Math.round((savings / pkg.original_price_naira) * 100)
                  : 0;
                const specs = pkg.specifications as Record<string, string>;

                return (
                  <article
                    key={pkg.id}
                    className={cn(
                      "group flex flex-col overflow-hidden rounded-[1.75rem] border bg-card",
                      index === 0 ? "border-brand ring-1 ring-brand" : "border-border"
                    )}
                  >
                    {/* Image */}
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      {pkg.image_url ? (
                        <img
                          src={pkg.image_url}
                          alt={pkg.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.25} />
                        </div>
                      )}

                      <div className="absolute top-4 left-4 flex gap-2">
                        {index === 0 && (
                          <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-foreground">
                            Recommended
                          </span>
                        )}
                        {savingsPercent > 0 && (
                          <span className="rounded-full bg-background/90 px-2.5 py-0.5 text-xs font-medium backdrop-blur">
                            Save {savingsPercent}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-6 md:p-8">
                      <h3 className="font-serif-display text-3xl">{pkg.name}</h3>

                      {pkg.description && (
                        <p className="mt-3 leading-relaxed text-muted-foreground">
                          {pkg.description}
                        </p>
                      )}

                      {/* What's Included */}
                      {specs && Object.keys(specs).length > 0 && (
                        <div className="mt-8 border-t border-border pt-6">
                          <h4 className="text-sm font-medium">What's included</h4>
                          <dl className="mt-4 space-y-3 text-sm">
                            {Object.entries(specs)
                              .filter(([key]) => !["Best For", "Included Items"].includes(key))
                              .map(([key, value]) => (
                                <div key={key} className="grid grid-cols-3 gap-4">
                                  <dt className="text-muted-foreground">{key}</dt>
                                  <dd className="col-span-2">{value}</dd>
                                </div>
                              ))}
                          </dl>
                        </div>
                      )}

                      {specs?.["Best For"] && (
                        <p className="mt-6 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Best for:</span> {specs["Best For"]}
                        </p>
                      )}

                      {/* Pricing */}
                      <div className="mt-auto pt-8">
                        <div className="flex items-baseline gap-3">
                          <span className="text-3xl font-semibold tracking-tight">{formatNaira(pkg.price_naira)}</span>
                          {pkg.original_price_naira && pkg.original_price_naira > pkg.price_naira && (
                            <span className="text-muted-foreground line-through">
                              {formatNaira(pkg.original_price_naira)}
                            </span>
                          )}
                        </div>
                        {savings > 0 && (
                          <p className="mt-1 text-sm text-success">
                            You save {formatNaira(savings)} with this bundle
                          </p>
                        )}

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                          <Button
                            variant={index === 0 ? "brand" : "default"}
                            className="sm:flex-1"
                            onClick={(e) => handleAddToCart(pkg.id, e)}
                            disabled={!pkg.in_stock}
                          >
                            <ShoppingCart />
                            Add to cart
                          </Button>
                          <Button variant="outline" className="sm:flex-1" asChild>
                            <Link to={`/product/${pkg.id}`}>View details</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="panel py-16 text-center">
              <Package className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" strokeWidth={1.25} />
              <h3 className="text-lg font-semibold">No {tierInfo.name} packages available</h3>
              <p className="mt-1 text-muted-foreground">
                Check back soon for curated {tierInfo.name.toLowerCase()} bundles.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Other Tiers */}
      <section className="section bg-muted/40">
        <div className="container">
          <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">
            Explore other tiers
          </h2>
          <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
            {otherTiers.map((key) => {
              const otherTierInfo = TIERS[key];

              return (
                <Link
                  key={key}
                  to={`/packages/${key}`}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-background p-6 transition-colors hover:border-foreground/20"
                >
                  <div>
                    <h3 className="text-lg font-semibold">{otherTierInfo.name} packages</h3>
                    <p className="text-sm text-muted-foreground">{otherTierInfo.priceRange}</p>
                  </div>
                  <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Need help choosing?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Book a free consultation with our creator experts.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Button size="lg" asChild>
                <Link to="/consultations">
                  Book a free consultation
                  <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/shop">Browse individual products</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default TierPackages;
