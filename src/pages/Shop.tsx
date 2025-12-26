import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, SlidersHorizontal, Package, Eye, ShoppingCart, Coins, Heart, Info } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ProductFilters from "@/components/shop/ProductFilters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { formatNaira, formatCoins } from "@/lib/constants";
import { cn } from "@/lib/utils";

const tierColors = {
  basic: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  premium: "bg-primary/10 text-primary border-primary/30",
  diamond: "bg-violet-500/10 text-violet-500 border-violet-500/30",
};

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);
  
  // Get initial filter values from URL
  const initialTier = searchParams.get("tier");
  const [selectedTiers, setSelectedTiers] = useState<string[]>(
    initialTier ? [initialTier] : []
  );
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [showPackagesOnly, setShowPackagesOnly] = useState(false);

  const { products, isLoading } = useProducts();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Separate packages and individual products
  const { packages, individualProducts } = useMemo(() => {
    if (!products) return { packages: [], individualProducts: [] };
    return {
      packages: products.filter(p => p.is_package),
      individualProducts: products.filter(p => !p.is_package),
    };
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    const productsToFilter = showPackagesOnly ? packages : individualProducts;

    return productsToFilter.filter((product) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Tier filter
      if (selectedTiers.length > 0 && !selectedTiers.includes(product.tier)) {
        return false;
      }

      // Content type filter
      if (selectedContentTypes.length > 0) {
        const productTypes = product.content_types || [];
        const hasMatchingType = selectedContentTypes.some((type) =>
          productTypes.includes(type as any)
        );
        if (!hasMatchingType) return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedTiers, selectedContentTypes, showPackagesOnly, packages, individualProducts]);

  const handleTierChange = (tier: string) => {
    setSelectedTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );
  };

  const handleContentTypeChange = (type: string) => {
    setSelectedContentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleClearFilters = () => {
    setSelectedTiers([]);
    setSelectedContentTypes([]);
    setShowPackagesOnly(false);
    setSearchQuery("");
    setSearchParams({});
  };

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId);
  };

  const handleWishlistToggle = (productId: string) => {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  // Calculate bulk savings for a product (simulated - would need actual package data)
  const calculateBulkSavings = (product: typeof individualProducts[0]) => {
    // Find if this product is part of any package
    const packageWithProduct = packages.find(pkg => 
      pkg.package_items?.includes(product.id)
    );
    
    if (packageWithProduct && packageWithProduct.original_price_naira) {
      const savings = packageWithProduct.original_price_naira - packageWithProduct.price_naira;
      const savingsPercent = Math.round((savings / packageWithProduct.original_price_naira) * 100);
      return { savings, savingsPercent, packageName: packageWithProduct.name };
    }
    
    // Default bulk savings estimate (15-25% off when buying in packages)
    const estimatedSavings = Math.round(product.price_naira * 0.20);
    return { savings: estimatedSavings, savingsPercent: 20, packageName: null };
  };

  return (
    <Layout>
      <div className="bg-muted/30 py-8 md:py-12">
        <div className="container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl mb-2">
              Shop Equipment
            </h1>
            <p className="text-muted-foreground text-lg mb-4">
              Browse our curated selection of individual creator equipment
            </p>
            
            {/* Link to Packages */}
            <Link to="/packages">
              <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Looking for bundles?</p>
                  <p className="text-sm text-muted-foreground">Check out our curated packages and save up to 25%</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Search and Filter Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {(selectedTiers.length > 0 || selectedContentTypes.length > 0 || showPackagesOnly) && (
                <Badge variant="secondary" className="ml-1">
                  {selectedTiers.length + selectedContentTypes.length + (showPackagesOnly ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filters */}
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleContent className="mb-8">
              <div className="rounded-lg border border-border bg-background p-4">
                <ProductFilters
                  selectedTiers={selectedTiers}
                  selectedContentTypes={selectedContentTypes}
                  onTierChange={handleTierChange}
                  onContentTypeChange={handleContentTypeChange}
                  onClearFilters={handleClearFilters}
                  showPackagesOnly={showPackagesOnly}
                  onPackagesOnlyChange={setShowPackagesOnly}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} {showPackagesOnly ? "packages" : "products"}
            </p>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const isWishlisted = isInWishlist(product.id);
                const bulkSavings = calculateBulkSavings(product);
                const specs = product.specifications as Record<string, string> | null;

                return (
                  <Card 
                    key={product.id} 
                    className="group h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30"
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-16 w-16 text-muted-foreground/50" />
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        <Badge variant="outline" className={tierColors[product.tier]}>
                          {product.tier.charAt(0).toUpperCase() + product.tier.slice(1)}
                        </Badge>
                        {product.is_package && (
                          <Badge variant="secondary">Package</Badge>
                        )}
                      </div>

                      {/* Wishlist Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "absolute top-3 right-3 bg-background/80 hover:bg-background",
                          isWishlisted && "text-red-500"
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          handleWishlistToggle(product.id);
                        }}
                      >
                        <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
                      </Button>

                      {/* Out of Stock Overlay */}
                      {!product.in_stock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                          <Badge variant="destructive">Out of Stock</Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4 flex flex-col h-[calc(100%-theme(spacing.64))]">
                      {/* Content Types */}
                      {product.content_types && product.content_types.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1">
                          {product.content_types.slice(0, 3).map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type.replace("_", " ")}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Name */}
                      <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>

                      {/* Description / Specs */}
                      {product.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {/* Key Specifications */}
                      {specs && Object.keys(specs).length > 0 && (
                        <div className="mt-2 space-y-1">
                          {Object.entries(specs).slice(0, 2).map(([key, value]) => (
                            <p key={key} className="text-xs text-muted-foreground">
                              <span className="font-medium">{key}:</span> {value}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Pricing */}
                      <div className="mt-auto pt-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-foreground">
                            {formatNaira(product.price_naira)}
                          </span>
                          {product.original_price_naira && product.original_price_naira > product.price_naira && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatNaira(product.original_price_naira)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Coins className="h-4 w-4 text-coin" />
                          <span>{formatCoins(product.price_coins)} coins</span>
                        </div>

                        {/* Bulk Savings Indicator */}
                        {!product.is_package && (
                          <div className="flex items-center gap-1 pt-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 text-xs text-green-600 cursor-help">
                                  <Info className="h-3 w-3" />
                                  <span>Save ~{bulkSavings.savingsPercent}% in bundles</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>
                                  {bulkSavings.packageName 
                                    ? `Part of "${bulkSavings.packageName}" bundle. Save ${formatNaira(bulkSavings.savings)} when you buy the package!`
                                    : `Buy this item as part of a bundle and save approximately ${formatNaira(bulkSavings.savings)}.`
                                  }
                                </p>
                                <Link to="/packages" className="text-primary hover:underline text-xs mt-1 block">
                                  View Packages →
                                </Link>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <Link to={`/product/${product.id}`} className="flex-1">
                          <Button variant="outline" className="w-full gap-2" size="sm">
                            <Eye className="h-4 w-4" />
                            Details
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          className="gap-2"
                          disabled={!product.in_stock}
                          onClick={() => handleAddToCart(product.id)}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No products found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search query
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Shop;
