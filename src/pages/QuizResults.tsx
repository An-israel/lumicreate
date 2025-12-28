import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Sparkles, ShoppingCart, ArrowRight, RotateCcw, Package, Coins, Check, GitCompare } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { formatNaira, formatCoins } from "@/lib/constants";
import { toast } from "sonner";
import ProductComparison from "@/components/quiz/ProductComparison";
import EmailCapture from "@/components/quiz/EmailCapture";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price_naira: number;
  price_coins: number;
  image_url: string | null;
  tier: "basic" | "premium" | "diamond";
  content_types: string[] | null;
  is_package: boolean | null;
  in_stock: boolean | null;
}

interface RecommendationCategory {
  title: string;
  description: string;
  products: Product[];
}

const QuizResults = () => {
  const [searchParams] = useSearchParams();
  const [recommendations, setRecommendations] = useState<RecommendationCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const answers = {
    content_type: searchParams.get("content_type") || "youtube",
    experience: searchParams.get("experience") || "beginner",
    setup_location: searchParams.get("setup_location") || "home",
    priority: searchParams.get("priority") || "complete",
    frequency: searchParams.get("frequency") || "weekly",
    budget: searchParams.get("budget") || "mid",
  };

  // Determine recommended tier based on budget
  const getTierFromBudget = (budget: string): "basic" | "premium" | "diamond" => {
    switch (budget) {
      case "basic":
        return "basic";
      case "diamond":
        return "diamond";
      default:
        return "premium";
    }
  };

  const recommendedTier = getTierFromBudget(answers.budget);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        // Fetch products matching content type and tier
        const { data: allProducts, error } = await supabase
          .from("products")
          .select("*")
          .eq("in_stock", true)
          .order("price_naira", { ascending: true });

        if (error) throw error;

        const products = allProducts as Product[];

        // Filter and categorize products
        const contentType = answers.content_type;
        const tier = recommendedTier;

        // Get packages that match content type and tier
        const matchingPackages = products.filter(
          (p) =>
            p.is_package &&
            p.tier === tier &&
            (p.content_types?.includes(contentType) || p.content_types?.includes("general"))
        );

        // Get individual products matching priority
        const priorityProducts = products.filter((p) => {
          if (p.is_package) return false;
          const name = p.name.toLowerCase();
          const desc = (p.description || "").toLowerCase();
          
          switch (answers.priority) {
            case "audio":
              return name.includes("mic") || name.includes("audio") || desc.includes("microphone");
            case "lighting":
              return name.includes("light") || name.includes("ring") || desc.includes("lighting");
            case "video":
              return name.includes("camera") || name.includes("gimbal") || desc.includes("video");
            default:
              return true;
          }
        }).slice(0, 4);

        // Get budget-appropriate products
        const budgetProducts = products.filter((p) => !p.is_package && p.tier === tier).slice(0, 6);

        // Get starter essentials for beginners
        const starterProducts = answers.experience === "beginner" 
          ? products.filter((p) => p.tier === "basic" && !p.is_package).slice(0, 4)
          : [];

        const categories: RecommendationCategory[] = [];

        if (matchingPackages.length > 0) {
          categories.push({
            title: "Recommended Packages",
            description: `Complete ${tier} packages perfect for ${contentType.replace("_", " ")} creators`,
            products: matchingPackages.slice(0, 3),
          });
        }

        if (priorityProducts.length > 0 && answers.priority !== "complete") {
          categories.push({
            title: `Top ${answers.priority.charAt(0).toUpperCase() + answers.priority.slice(1)} Upgrades`,
            description: `Address your ${answers.priority} quality challenges with these picks`,
            products: priorityProducts,
          });
        }

        if (budgetProducts.length > 0) {
          categories.push({
            title: "Within Your Budget",
            description: `Quality ${tier} equipment that fits your investment range`,
            products: budgetProducts,
          });
        }

        if (starterProducts.length > 0) {
          categories.push({
            title: "Beginner Essentials",
            description: "Great starting pieces to build your setup",
            products: starterProducts,
          });
        }

        setRecommendations(categories);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        toast.error("Failed to load recommendations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [searchParams]);

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      toast.error("Please sign in to add items to cart");
      return;
    }
    await addToCart(product.id, 1);
    toast.success(`${product.name} added to cart`);
  };

  const toggleCompare = (product: Product) => {
    setCompareProducts((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 4) {
        toast.error("You can compare up to 4 products at a time");
        return prev;
      }
      return [...prev, product];
    });
    setShowComparison(true);
  };

  const removeFromCompare = (productId: string) => {
    setCompareProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const isInCompare = (productId: string) => {
    return compareProducts.some((p) => p.id === productId);
  };

  const getExperienceLabel = (exp: string) => {
    const labels: Record<string, string> = {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
      professional: "Professional",
    };
    return labels[exp] || exp;
  };

  const getContentLabel = (content: string) => {
    const labels: Record<string, string> = {
      youtube: "YouTube",
      tiktok: "TikTok/Reels",
      podcast: "Podcasts",
      live_streaming: "Live Streaming",
      photography: "Photography",
    };
    return labels[content] || content;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 py-12 md:py-20">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1 text-primary" />
              Your Personalized Recommendations
            </Badge>
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl lg:text-5xl mb-4">
              We Found Your{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Perfect Setup
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Based on your answers, here are our top equipment recommendations tailored just for you.
            </p>

            {/* Summary Cards */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <Badge variant="secondary" className="text-sm py-1.5 px-3">
                {getContentLabel(answers.content_type)} Creator
              </Badge>
              <Badge variant="secondary" className="text-sm py-1.5 px-3">
                {getExperienceLabel(answers.experience)} Level
              </Badge>
              <Badge variant="secondary" className="text-sm py-1.5 px-3 capitalize">
                {recommendedTier} Tier Recommended
              </Badge>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button variant="outline" asChild>
                <Link to="/quiz" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Retake Quiz
                </Link>
              </Button>
              <Button asChild>
                <Link to="/packages" className="gap-2">
                  Browse All Packages
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Recommendations */}
          {isLoading ? (
            <div className="space-y-12">
              {[1, 2].map((i) => (
                <div key={i}>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-5 w-96 mb-6" />
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-80" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            <Card className="max-w-lg mx-auto text-center py-12">
              <CardContent>
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">No exact matches found</h2>
                <p className="text-muted-foreground mb-6">
                  We couldn't find products matching all your criteria. Check out our full catalog!
                </p>
                <Button asChild>
                  <Link to="/shop">Browse All Products</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-16">
              {recommendations.map((category, index) => (
                <section key={index}>
                  <div className="mb-6">
                    <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                      {category.title}
                    </h2>
                    <p className="text-muted-foreground">{category.description}</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {category.products.map((product) => (
                      <Card
                        key={product.id}
                        className={`overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col ${
                          isInCompare(product.id) ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        {/* Image */}
                        <div className="aspect-square bg-muted relative overflow-hidden">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Package className="h-16 w-16 text-muted-foreground/50" />
                            </div>
                          )}
                          {product.is_package && (
                            <Badge className="absolute top-3 left-3 bg-primary">
                              Package
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm capitalize"
                          >
                            {product.tier}
                          </Badge>
                          {/* Compare Checkbox */}
                          <div
                            className="absolute bottom-3 left-3 flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-md px-2 py-1 cursor-pointer"
                            onClick={() => toggleCompare(product)}
                          >
                            <Checkbox
                              checked={isInCompare(product.id)}
                              onCheckedChange={() => toggleCompare(product)}
                              className="h-4 w-4"
                            />
                            <span className="text-xs font-medium text-foreground">Compare</span>
                          </div>
                        </div>

                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                        </CardHeader>

                        <CardContent className="pb-4 flex-1">
                          {product.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                              {product.description}
                            </p>
                          )}
                          <div className="space-y-1">
                            <p className="text-xl font-bold text-foreground">
                              {formatNaira(product.price_naira)}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Coins className="h-4 w-4 text-coin" />
                              <span>{formatCoins(product.price_coins)} coins</span>
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter className="pt-0 gap-2">
                          <Button
                            className="flex-1 gap-2"
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Add to Cart
                          </Button>
                          <Button variant="outline" asChild>
                            <Link to={`/product/${product.id}`}>View</Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* Email Capture */}
          {!isLoading && recommendations.length > 0 && (
            <div className="mt-12 max-w-2xl mx-auto">
              <EmailCapture quizAnswers={answers} />
            </div>
          )}

          {/* Compare Button - Floating */}
          {compareProducts.length > 0 && !showComparison && (
            <div className="fixed bottom-6 right-6 z-40">
              <Button
                size="lg"
                className="gap-2 shadow-lg"
                onClick={() => setShowComparison(true)}
              >
                <GitCompare className="h-5 w-5" />
                Compare ({compareProducts.length})
              </Button>
            </div>
          )}

          {/* Bottom CTA */}
          {!isLoading && recommendations.length > 0 && (
            <div className="mt-16 text-center">
              <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/20">
                <CardContent className="py-8">
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    Need Help Deciding?
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Book a free consultation with our equipment experts to get personalized advice.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <Button variant="outline" asChild>
                      <Link to="/consultations">Book Consultation</Link>
                    </Button>
                    <Button asChild>
                      <Link to="/cart" className="gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        View Cart
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Product Comparison Panel */}
        {showComparison && compareProducts.length > 0 && (
          <ProductComparison
            products={compareProducts}
            onRemove={removeFromCompare}
            onAddToCart={handleAddToCart}
            onClose={() => setShowComparison(false)}
          />
        )}
      </div>
    </Layout>
  );
};

export default QuizResults;
