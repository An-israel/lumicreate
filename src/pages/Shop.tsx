import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Package, Eye, ShoppingCart, Heart, Mic, Lightbulb, Camera, Headphones, Scale } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import ProductComparison from "@/components/quiz/ProductComparison";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { formatNaira } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Product } from "@/types/database";
import { toast } from "sonner";

const tierColors = {
  basic: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  premium: "bg-primary/10 text-primary border-primary/30",
  diamond: "bg-violet-500/10 text-violet-500 border-violet-500/30",
};

// Categories for individual products
const productCategories = [
  { 
    id: "all", 
    label: "All Products", 
    icon: Package,
    description: "Browse all individual equipment"
  },
  { 
    id: "microphones", 
    label: "Microphones", 
    icon: Mic,
    description: "From lavaliers to broadcast mics",
    keywords: ["microphone", "mic", "lavalier", "shotgun", "condenser", "dynamic", "wireless"]
  },
  { 
    id: "key-lights", 
    label: "Key Lights", 
    icon: Lightbulb,
    description: "Main light sources for your setup",
    keywords: ["key light", "ring light", "sl-60", "120d", "main light"]
  },
  { 
    id: "fill-lights", 
    label: "Fill Lights", 
    icon: Lightbulb,
    description: "Secondary lighting for balance",
    keywords: ["fill", "secondary", "panel", "660"]
  },
  { 
    id: "background-lights", 
    label: "Background Lights", 
    icon: Lightbulb,
    description: "RGB and ambient lighting",
    keywords: ["background", "rgb", "strip", "mc", "ambient", "accent"]
  },
  { 
    id: "rim-lights", 
    label: "Rim Lights", 
    icon: Lightbulb,
    description: "Hair and separation lighting",
    keywords: ["rim", "hair", "separation", "sz150"]
  },
  { 
    id: "stands-mounts", 
    label: "Stands & Mounts", 
    icon: Camera,
    description: "Tripods, C-stands, boom arms",
    keywords: ["tripod", "stand", "c-stand", "boom arm", "mount"]
  },
  { 
    id: "audio-gear", 
    label: "Audio Gear", 
    icon: Headphones,
    description: "Interfaces, headphones, accessories",
    keywords: ["interface", "headphones", "audio", "scarlett", "rodecaster", "focusrite"]
  },
];

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const initialTier = searchParams.get("tier");
  const [selectedTier, setSelectedTier] = useState<string | null>(initialTier);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);

  const { products, isLoading } = useProducts({ isPackage: false });
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

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

  // Categorize products
  const categorizeProduct = (product: Product): string[] => {
    const categories: string[] = [];
    const name = product.name.toLowerCase();
    const description = (product.description || "").toLowerCase();
    const specs = product.specifications as Record<string, string> | null;
    const lightType = specs?.["Light Type"]?.toLowerCase() || "";
    const type = specs?.["Type"]?.toLowerCase() || "";

    for (const category of productCategories) {
      if (category.id === "all") continue;
      
      const keywords = category.keywords || [];
      const matchesKeyword = keywords.some(keyword => 
        name.includes(keyword) || 
        description.includes(keyword) ||
        lightType.includes(keyword) ||
        type.includes(keyword)
      );
      
      if (matchesKeyword) {
        categories.push(category.id);
      }
    }
    
    return categories.length > 0 ? categories : ["other"];
  };

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
        const productCategories = categorizeProduct(product);
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
      const categories = categorizeProduct(product);
      for (const cat of categories) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    }
    
    return counts;
  }, [products]);

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

  return (
    <Layout>
      <div className="bg-muted/30 py-8 md:py-12">
        <div className="container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl mb-2">
              Individual Equipment
            </h1>
            <p className="text-muted-foreground text-lg mb-4">
              Browse and buy individual pieces — microphones, lights, stands, and more
            </p>
            
            {/* Link to Packages */}
            <Link to="/packages">
              <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Want complete setups?</p>
                  <p className="text-sm text-muted-foreground">Check our curated packages and save up to 25%</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Search and Tier Filter */}
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
            <div className="flex gap-2">
              <Button
                variant={selectedTier === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTier(null)}
              >
                All Tiers
              </Button>
              <Button
                variant={selectedTier === "basic" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTier(selectedTier === "basic" ? null : "basic")}
                className={selectedTier === "basic" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
              >
                Basic
              </Button>
              <Button
                variant={selectedTier === "premium" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTier(selectedTier === "premium" ? null : "premium")}
              >
                Premium
              </Button>
              <Button
                variant={selectedTier === "diamond" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTier(selectedTier === "diamond" ? null : "diamond")}
                className={selectedTier === "diamond" ? "bg-violet-500 hover:bg-violet-600" : ""}
              >
                Diamond
              </Button>
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
            <TabsList className="h-auto flex-wrap gap-2 bg-transparent p-0">
              {productCategories.map((category) => {
                const Icon = category.icon;
                const count = categoryCounts[category.id] || 0;
                
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className={cn(
                      "gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                      "border border-border rounded-full px-4 py-2"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {category.label}
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {count}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Category Description */}
            {selectedCategory !== "all" && (
              <p className="mt-4 text-sm text-muted-foreground">
                {productCategories.find(c => c.id === selectedCategory)?.description}
              </p>
            )}
          </Tabs>

          {/* Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} products
            </p>
            {(searchQuery || selectedTier || selectedCategory !== "all") && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTier(null);
                  setSelectedCategory("all");
                }}
              >
                Clear filters
              </Button>
            )}
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
                const specs = product.specifications as Record<string, string> | null;
                const grade = specs?.["Grade"];
                const lightType = specs?.["Light Type"];
                const type = specs?.["Type"];

                return (
                  <Card 
                    key={product.id} 
                    className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30"
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
                      </div>

                      {/* Compare Checkbox */}
                      <div 
                        className="absolute bottom-3 left-3 flex items-center gap-2 bg-background/90 rounded-md px-2 py-1 cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleCompare(product);
                        }}
                      >
                        <Checkbox 
                          checked={isComparing(product.id)}
                          onCheckedChange={() => toggleCompare(product)}
                        />
                        <span className="text-xs font-medium">Compare</span>
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

                    <CardContent className="p-4 flex flex-col flex-1">
                      {/* Type/Grade Badge */}
                      {(grade || lightType || type) && (
                        <div className="mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {lightType || type || grade}
                          </Badge>
                        </div>
                      )}

                      {/* Name */}
                      <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>

                      {/* Description */}
                      {product.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {/* Key Spec */}
                      {specs?.["Best For"] && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          <span className="font-medium">Best for:</span> {specs["Best For"]}
                        </p>
                      )}

                      {/* Pricing */}
                      <div className="mt-auto pt-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-foreground">
                            {formatNaira(product.price_naira)}
                          </span>
                        </div>
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
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTier(null);
                  setSelectedCategory("all");
                }}
              >
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
