import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CartItem, Product } from "@/types/database";
import { toast } from "sonner";

interface CartContextType {
  items: (CartItem & { product: Product })[];
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalNaira: number;
  totalCoins: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<(CartItem & { product: Product })[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from("cart_items")
      .select(`*, product:products(*)`)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching cart:", error);
    } else {
      setItems(data as (CartItem & { product: Product })[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId: string, quantity = 1) => {
    if (!user) {
      toast.error("Please sign in to add items to cart");
      return;
    }

    const existingItem = items.find((item) => item.product_id === productId);

    if (existingItem) {
      await updateQuantity(productId, existingItem.quantity + quantity);
    } else {
      const { error } = await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: productId,
        quantity,
      });

      if (error) {
        toast.error("Failed to add item to cart");
        console.error(error);
      } else {
        toast.success("Added to cart");
        await fetchCart();
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (error) {
      toast.error("Failed to remove item");
      console.error(error);
    } else {
      toast.success("Removed from cart");
      await fetchCart();
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) return;

    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (error) {
      toast.error("Failed to update quantity");
      console.error(error);
    } else {
      await fetchCart();
    }
  };

  const clearCart = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
    } else {
      setItems([]);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalNaira = items.reduce(
    (sum, item) => sum + item.product.price_naira * item.quantity,
    0
  );
  const totalCoins = items.reduce(
    (sum, item) => sum + item.product.price_coins * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalNaira,
        totalCoins,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}