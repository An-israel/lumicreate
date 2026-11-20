import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Package, ArrowRight } from "lucide-react";
import { ALL_CATEGORY, PRODUCT_CATEGORIES, getProductCategories } from "@/lib/productCategories";
import Layout from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/shop/ProductCard";
import ProductComparison from "@/components/quiz/ProductComparison";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { Product } from "@/types/database";
import { toast } from "sonner";

const productCategories = [ALL_CATEGORY, ...PRODUCT_CATEGORIES];

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const initialTier = searchParams.get("tier");
  const [selectedTier, setSelectedTier] = useState<string | null>(initialTier);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);

  const { products, isLoading } = useProducts({ isPackage: false });
  const { addToCart } = useCart();

  // Toggle product for comparison
  const toggleCompare = (product: Product) => {
    setCompareProducts(prev => {
      const isSelected = prev.some(p => p.id === product.id);
      if (isSelected) {
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 3) {
        toast.error("You can compare up to 3 products");
        return prev;
      }
      return [...prev, product];
    });
  };

  const isComparing = (productId: string) => compareProducts.some(p => p.id === productId);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
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
      if (selectedTier && product.tier !== selectedTier) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "all") {
        const productCategories = getProductCategories(product);
        if (!productCategories.includes(selectedCategory)) {
          return false;
        }
      }

      return true;
    });
  }, [products, searchQuery, selectedTier, selectedCategory]);

  // Get counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    
    for (const product of products) {
      const categories = getProductCategories(product);
      for (const cat of categories) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    }
    
    return counts;
  }, [products]);

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId);
  };

  const hasFilters = !!searchQuery || !!selectedTier || selectedCategory !== "all";
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTier(null);
    setSelectedCategory("all");
  };

  const tiers = [
    { id: null, label: "All tiers" },
    { id: "basic", label: "Basic" },
    { id: "premium", label: "Premium" },
    { id: "diamond", label: "Diamond" },
  ];

  return (
    <Layout>
      <div className="pt-12 pb-20 md:pt-16">
        <div className="container">
          {/* Header */}
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                Shop equipment
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">
                Microphones, lights, stands and more — sold individually.
              </p>
            </div>
            <Link
              to="/packages"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary"
            >
              Want a complete setup? Save up to 25% with packages
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Search and Tier Filter */}
          <div className="flex flex-col gap-3 border-y border-border py-4 md:flex-row md:items-center md:justify-between">
            <div className="relative md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-full border-transparent bg-muted pl-10 focus-visible:bg-background"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto">
              {tiers.map((tier) => (
                <Button
                  key={tier.label}
                  variant={selectedTier === tier.id ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(selectedTier !== tier.id && "text-muted-foreground")}
                  onClick={() => setSelectedTier(tier.id === null || selectedTier === tier.id ? null : tier.id)}
                >
                  {tier.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Category chips */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:flex-wrap md:px-0">
            {productCategories.map((category) => {
              const Icon = category.icon;
              const count = categoryCounts[category.id] || 0;
              const active = selectedCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  {category.label}
                  <span className={cn("tabular-nums text-xs", active ? "text-background/60" : "text-muted-foreground/70")}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Results Count */}
          <div className="mt-8 mb-6 flex items-center justify-between text-sm text-muted-foreground">
            <p>
              {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
              {selectedCategory !== "all" && (
                <> · {productCategories.find(c => c.id === selectedCategory)?.description}</>
              )}
            </p>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid gap-x-6 gap-y-10 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid gap-x-4 gap-y-10 grid-cols-2 md:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  compare={{ checked: isComparing(product.id), onToggle: () => toggleCompare(product) }}
                />
              ))}
            </div>
          ) : (
            <div className="panel flex flex-col items-center justify-center py-20 text-center">
              <Package className="h-10 w-10 text-muted-foreground/50 mb-4" strokeWidth={1.25} />
              <h3 className="text-lg font-semibold text-foreground">
                No products found
              </h3>
              <p className="mt-1 text-muted-foreground mb-6">
                Try adjusting your filters or search.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Panel */}
      <ProductComparison
        products={compareProducts}
        onRemove={(productId) => setCompareProducts(prev => prev.filter(p => p.id !== productId))}
        onAddToCart={(product) => handleAddToCart(product.id)}
        onClose={() => setCompareProducts([])}
      />
    </Layout>
  );
};

export default Shop;
