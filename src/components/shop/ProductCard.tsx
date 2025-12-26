import { Link } from "react-router-dom";
import { ShoppingCart, Coins, Package, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/database";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { formatNaira, formatCoins } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

const tierColors = {
  basic: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  premium: "bg-primary/10 text-primary border-primary/30",
  diamond: "bg-violet-500/10 text-violet-500 border-violet-500/30",
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    await addToCart(product.id);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30">
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
            className={cn("absolute top-3 right-3 bg-background/80 hover:bg-background", isWishlisted && "text-red-500")}
            onClick={handleWishlistToggle}
          >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
          </Button>

          {/* Out of Stock Overlay */}
          {!product.in_stock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
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

          {/* Description */}
          {product.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Pricing */}
          <div className="mt-3 space-y-1">
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
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full gap-2"
            disabled={!product.in_stock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard;
