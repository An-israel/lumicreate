import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Package } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/shop/ProductCard";
import ProductFilters from "@/components/shop/ProductFilters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useProducts } from "@/hooks/useProducts";

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

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
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

      // Packages only filter
      if (showPackagesOnly && !product.is_package) {
        return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedTiers, selectedContentTypes, showPackagesOnly]);

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

  return (
    <Layout>
      <div className="bg-muted/30 py-8 md:py-12">
        <div className="container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl mb-2">
              Shop Equipment
            </h1>
            <p className="text-muted-foreground text-lg">
              Browse our curated selection of creator equipment
            </p>
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
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
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
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
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
