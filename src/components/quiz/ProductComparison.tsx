import { X, Check, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formatNaira, formatCoins } from "@/lib/constants";

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

interface ProductComparisonProps {
  products: Product[];
  onRemove: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onClose: () => void;
}

const tierColors = {
  basic: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  premium: "bg-primary/10 text-primary border-primary/30",
  diamond: "bg-violet-500/10 text-violet-500 border-violet-500/30",
};

const ProductComparison = ({ products, onRemove, onAddToCart, onClose }: ProductComparisonProps) => {
  if (products.length === 0) return null;

  const comparisonFeatures = [
    { label: "Price (Naira)", getValue: (p: Product) => formatNaira(p.price_naira) },
    { label: "Price (Coins)", getValue: (p: Product) => formatCoins(p.price_coins) },
    { label: "Tier", getValue: (p: Product) => p.tier.charAt(0).toUpperCase() + p.tier.slice(1) },
    { label: "Package", getValue: (p: Product) => p.is_package ? <Check className="h-5 w-5 text-emerald-500 mx-auto" /> : <Minus className="h-5 w-5 text-muted-foreground mx-auto" /> },
    { label: "In Stock", getValue: (p: Product) => p.in_stock ? <Check className="h-5 w-5 text-emerald-500 mx-auto" /> : <X className="h-5 w-5 text-destructive mx-auto" /> },
    { 
      label: "Content Types", 
      getValue: (p: Product) => p.content_types?.length 
        ? p.content_types.slice(0, 2).map(t => t.replace("_", " ")).join(", ") 
        : "General"
    },
  ];

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-primary bg-background shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="container py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Compare Products</h3>
            <Badge variant="secondary">{products.length} selected</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>
        </div>

        {/* Comparison Table */}
        <ScrollArea className="w-full">
          <div className="min-w-max">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-sm text-muted-foreground font-medium p-2 w-32">Feature</th>
                  {products.map((product) => (
                    <th key={product.id} className="p-2 min-w-[200px]">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-1 -right-1 h-6 w-6"
                          onClick={() => onRemove(product.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="flex flex-col items-center gap-2">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-16 w-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-muted rounded-lg" />
                          )}
                          <span className="text-sm font-medium text-foreground text-center line-clamp-2">
                            {product.name}
                          </span>
                          <Badge variant="outline" className={tierColors[product.tier]}>
                            {product.tier}
                          </Badge>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr key={feature.label} className={index % 2 === 0 ? "bg-muted/30" : ""}>
                    <td className="text-sm text-muted-foreground p-2 font-medium">{feature.label}</td>
                    {products.map((product) => (
                      <td key={product.id} className="text-sm text-center p-2 text-foreground">
                        {feature.getValue(product)}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Add to Cart Row */}
                <tr>
                  <td className="p-2"></td>
                  {products.map((product) => (
                    <td key={product.id} className="p-2 text-center">
                      <Button
                        size="sm"
                        className="gap-2"
                        disabled={!product.in_stock}
                        onClick={() => onAddToCart(product)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </Card>
  );
};

export default ProductComparison;
