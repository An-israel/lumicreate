import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/shop/ProductCard";
import ImageGallery from "@/components/product/ImageGallery";
import ProductReviews from "@/components/product/ProductReviews";
import RatingStars from "@/components/product/RatingStars";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  ShoppingCart, 
  Package, 
  Check, 
  ArrowLeft, 
  Truck, 
  Shield, 
  HeadphonesIcon,
  ChevronRight,
  Heart
} from "lucide-react";
import { formatNaira } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useReviews } from "@/hooks/useReviews";

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { product, isLoading, error } = useProduct(productId);
  const { products: allProducts } = useProducts();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { stats: reviewStats } = useReviews(productId);
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

  const handleWishlistToggle = () => {
    if (!product) return;
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const isWishlisted = product ? isInWishlist(product.id) : false;

  if (isLoading) {
    return (
      <Layout>
        <div className="container pt-6 pb-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
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
              <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
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

  
  // Combine image_url with image_urls for gallery
  const allImages = [
    ...(product.image_url ? [product.image_url] : []),
    ...(product.image_urls || [])
  ].filter(Boolean);

  return (
    <Layout>
      <div className="container pt-6 pb-20">
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
          <span className="truncate text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Product Image Gallery */}
          <div className="space-y-4">
            <div className="relative">
              <ImageGallery images={allImages} productName={product.name} />
              
              {product.is_package && (
                <Badge variant="secondary" className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur">
                  <Package className="h-3 w-3 mr-1" />
                  Package Deal
                </Badge>
              )}
              {!product.in_stock && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-xl z-10">
                  <Badge variant="destructive" className="text-lg py-2 px-4">
                    Out of Stock
                  </Badge>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 divide-x divide-border rounded-2xl border border-border">
              {[
                { icon: Truck, label: "Free delivery" },
                { icon: Shield, label: "Warranty" },
                { icon: HeadphonesIcon, label: "24/7 support" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-2 p-4 text-center">
                  <item.icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Tier Badge */}
            <div className="flex items-center justify-between">
              <p className="eyebrow">
                {product.tier.charAt(0).toUpperCase() + product.tier.slice(1)} tier
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleWishlistToggle}
                className={cn(isWishlisted && "text-red-500")}
              >
                <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
              </Button>
            </div>

            {/* Title & Rating */}
            <div>
              <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">{product.name}</h1>
              {reviewStats.totalReviews > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <RatingStars 
                    rating={reviewStats.averageRating} 
                    totalReviews={reviewStats.totalReviews}
                    size="md"
                  />
                  <span className="text-sm text-muted-foreground">
                    {reviewStats.averageRating.toFixed(1)} out of 5
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-lg leading-relaxed text-muted-foreground">{product.description}</p>

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
                <span className="text-3xl font-semibold tracking-tight">{formatNaira(product.price_naira)}</span>
                {product.original_price_naira && product.original_price_naira > product.price_naira && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatNaira(product.original_price_naira)}
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantity</span>
                <div className="flex items-center rounded-full border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    aria-label="Decrease quantity"
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
                    aria-label="Increase quantity"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!product.in_stock || isAdding}
                >
                  <ShoppingCart />
                  {isAdding ? "Adding…" : "Add to cart"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => {
                    handleAddToCart();
                    navigate("/cart");
                  }}
                  disabled={!product.in_stock}
                >
                  Buy now
                </Button>
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Specifications</h3>
                <dl className="divide-y divide-border border-y border-border">
                  {Object.entries(product.specifications as Record<string, string>).map(
                    ([key, value]) => (
                      <div key={key} className="flex justify-between gap-6 py-3 text-sm">
                        <dt className="text-muted-foreground capitalize">
                          {key.replace(/_/g, " ")}
                        </dt>
                        <dd className="text-right font-medium">{value}</dd>
                      </div>
                    )
                  )}
                </dl>
              </div>
            )}

            {/* Package Items (if it's a package) */}
            {product.is_package && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">What's included</h3>
                <ul className="space-y-2">
                  {["All essential equipment", "Setup guide included", "Priority support"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 border-t border-border pt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold tracking-tight">Related products</h2>
              <Button variant="ghost" asChild>
                <Link to="/shop">
                  View all
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}

        {/* Product Reviews */}
        <div className="mt-24 border-t border-border pt-16">
          <ProductReviews productId={productId!} />
        </div>
      </div>
    </Layout>
  );
}
