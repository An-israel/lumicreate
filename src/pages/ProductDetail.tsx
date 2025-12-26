import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  ShoppingCart, 
  Coins, 
  Package, 
  Check, 
  ArrowLeft, 
  Star, 
  Truck, 
  Shield, 
  HeadphonesIcon,
  ChevronRight
} from "lucide-react";
import { formatNaira, formatCoins, TIERS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Product } from "@/types/database";

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { product, isLoading, error } = useProduct(productId);
  const { products: allProducts } = useProducts();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Get related products (same tier or content type)
  const relatedProducts = allProducts
    .filter(
      (p) =>
        p.id !== productId &&
        (p.tier === product?.tier ||
          p.content_types?.some((ct) => product?.content_types?.includes(ct)))
    )
    .slice(0, 4);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    await addToCart(product.id, quantity);
    setIsAdding(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container-main py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-16 w-1/2" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container-main py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The product you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate("/shop")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const tierInfo = TIERS[product.tier as keyof typeof TIERS];

  return (
    <Layout>
      <div className="container-main py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/shop" className="hover:text-foreground transition-colors">
            Shop
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl bg-muted overflow-hidden relative">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
              {product.is_package && (
                <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">
                  <Package className="h-3 w-3 mr-1" />
                  Package Deal
                </Badge>
              )}
              {!product.in_stock && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Badge variant="destructive" className="text-lg py-2 px-4">
                    Out of Stock
                  </Badge>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 text-center">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 text-center">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium">Warranty</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 text-center">
                <HeadphonesIcon className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium">24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Tier Badge */}
            <Badge className={cn(tierInfo?.color, "text-white")}>
              {product.tier.charAt(0).toUpperCase() + product.tier.slice(1)} Tier
            </Badge>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold">{product.name}</h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground">{product.description}</p>

            {/* Content Types */}
            {product.content_types && product.content_types.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.content_types.map((type) => (
                  <Badge key={type} variant="outline" className="capitalize">
                    {type.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            )}

            {/* Pricing */}
            <div className="space-y-3">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold">{formatNaira(product.price_naira)}</span>
                {product.original_price_naira && product.original_price_naira > product.price_naira && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatNaira(product.original_price_naira)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-secondary">
                <Coins className="h-5 w-5" />
                <span className="text-lg font-semibold">{formatCoins(product.price_coins)} coins</span>
                <Badge variant="secondary" className="text-xs">Save more with coins!</Badge>
              </div>
            </div>

            <Separator />

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  className="flex-1 gradient-primary btn-glow"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!product.in_stock || isAdding}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {isAdding ? "Adding..." : "Add to Cart"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    handleAddToCart();
                    navigate("/cart");
                  }}
                  disabled={!product.in_stock}
                >
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Specifications</h3>
                <Card>
                  <CardContent className="pt-4">
                    <dl className="space-y-3">
                      {Object.entries(product.specifications as Record<string, string>).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <dt className="text-muted-foreground capitalize">
                              {key.replace(/_/g, " ")}
                            </dt>
                            <dd className="font-medium">{value}</dd>
                          </div>
                        )
                      )}
                    </dl>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Package Items (if it's a package) */}
            {product.is_package && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">What's Included</h3>
                <Card className="bg-accent/5 border-accent/20">
                  <CardContent className="pt-4">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-accent" />
                        All essential equipment
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-accent" />
                        Setup guide included
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-accent" />
                        Priority support
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Related Products</h2>
              <Button variant="ghost" asChild>
                <Link to="/shop">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} to={`/product/${relatedProduct.id}`}>
                  <Card className="overflow-hidden card-hover">
                    <div className="aspect-square bg-muted relative">
                      {relatedProduct.image_url ? (
                        <img
                          src={relatedProduct.image_url}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-1">{relatedProduct.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold">{formatNaira(relatedProduct.price_naira)}</span>
                        <span className="text-sm text-secondary">
                          {formatCoins(relatedProduct.price_coins)} 🪙
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
