import { Link } from "react-router-dom";
import { Plus, Package, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Product } from "@/types/database";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { formatNaira } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  /** Shows a "Compare" toggle on the image when provided */
  compare?: { checked: boolean; onToggle: () => void };
}


const ProductCard = ({ product, compare }: ProductCardProps) => {
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

  const tierLabel = product.tier.charAt(0).toUpperCase() + product.tier.slice(1);
  const specs = product.specifications as Record<string, string> | null;
  const kind =
    specs?.["Light Type"] ||
    specs?.["Type"] ||
    product.content_types?.slice(0, 2).map((type) => type.replace("_", " ")).join(", ");
  const onSale = !!product.original_price_naira && product.original_price_naira > product.price_naira;

  return (
    <Link to={`/product/${product.id}`} className="group flex h-full flex-col">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.25} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.is_package && (
            <Badge variant="secondary" className="bg-background/90 backdrop-blur">Package</Badge>
          )}
          {onSale && (
            <Badge className="border-transparent bg-brand text-brand-foreground hover:bg-brand">Sale</Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-3 right-3 h-9 w-9 bg-background/90 backdrop-blur hover:bg-background",
            isWishlisted && "text-red-500 hover:text-red-500"
          )}
          onClick={handleWishlistToggle}
        >
          <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
        </Button>

        {/* Quick add */}
        {product.in_stock && (
          <Button
            size="icon"
            aria-label="Add to cart"
            className="absolute bottom-3 right-3 h-10 w-10 bg-brand text-brand-foreground shadow-md hover:bg-brand hover:brightness-95 md:translate-y-2 md:opacity-0 md:transition-all md:group-hover:translate-y-0 md:group-hover:opacity-100"
            onClick={handleAddToCart}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {/* Compare toggle */}
        {compare && (
          <label
            className="absolute bottom-3 left-3 flex cursor-pointer items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium backdrop-blur"
            onClick={(e) => {
              e.preventDefault();
              compare.onToggle();
            }}
          >
            <Checkbox checked={compare.checked} className="h-3.5 w-3.5 rounded-[4px]" tabIndex={-1} />
            Compare
          </label>
        )}

        {/* Out of Stock Overlay */}
        {!product.in_stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <span className="rounded-full bg-background px-3 py-1 text-xs font-medium">Out of stock</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-xs text-muted-foreground">
          {tierLabel}
          {kind && <> · {kind}</>}
        </p>

        <h3 className="mt-1 font-medium leading-snug text-foreground line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-semibold text-foreground">
            {formatNaira(product.price_naira)}
          </span>
          {onSale && (
            <span className="text-sm text-muted-foreground line-through">
              {formatNaira(product.original_price_naira!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
