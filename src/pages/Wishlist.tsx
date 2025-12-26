import { Link } from "react-router-dom";
import { useWishlist } from "@/hooks/useWishlist";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  ShoppingCart,
  Package,
  Trash2,
  ChevronRight,
  Coins,
} from "lucide-react";
import { formatNaira, formatCoins } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Wishlist() {
  const { user, isLoading: authLoading } = useAuth();
  const { items: wishlistItems, isLoading: wishlistLoading, removeFromWishlist } = useWishlist();
  const { products, isLoading: productsLoading } = useProducts();
  const { addToCart } = useCart();

  const isLoading = authLoading || wishlistLoading || productsLoading;

  // Get full product details for wishlist items
  const wishlistProducts = wishlistItems
    .map((item) => products.find((p) => p.id === item.product_id))
    .filter(Boolean);

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId);
  };

  const handleRemove = (productId: string) => {
    removeFromWishlist(productId);
  };

  if (!user && !authLoading) {
    return (
      <Layout>
        <div className="container-main py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
              <p className="text-muted-foreground mb-4">
                Please sign in to view your wishlist.
              </p>
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-main py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Wishlist</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground mt-1">
              {wishlistProducts.length} {wishlistProducts.length === 1 ? "item" : "items"} saved
            </p>
          </div>
          {wishlistProducts.length > 0 && (
            <Button asChild variant="outline">
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : wishlistProducts.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-8 pb-8 text-center">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">
                Start saving products you love by clicking the heart icon on any product.
              </p>
              <Button asChild className="gradient-primary">
                <Link to="/shop">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Browse Products
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => (
              <Card key={product!.id} className="overflow-hidden group">
                <Link to={`/product/${product!.id}`}>
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {product!.image_url ? (
                      <img
                        src={product!.image_url}
                        alt={product!.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-muted-foreground/50" />
                      </div>
                    )}
                    {!product!.in_stock && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <Badge variant="destructive">Out of Stock</Badge>
                      </div>
                    )}
                  </div>
                </Link>

                <CardContent className="p-4">
                  <Link to={`/product/${product!.id}`}>
                    <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                      {product!.name}
                    </h3>
                  </Link>

                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">
                        {formatNaira(product!.price_naira)}
                      </span>
                      {product!.original_price_naira &&
                        product!.original_price_naira > product!.price_naira && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatNaira(product!.original_price_naira)}
                          </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-secondary">
                      <Coins className="h-4 w-4" />
                      <span>{formatCoins(product!.price_coins)} coins</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      className="flex-1"
                      size="sm"
                      disabled={!product!.in_stock}
                      onClick={() => handleAddToCart(product!.id)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemove(product!.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
