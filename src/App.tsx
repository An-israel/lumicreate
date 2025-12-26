import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { WishlistProvider } from "@/hooks/useWishlist";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import BuyCoins from "./pages/BuyCoins";
import Consultations from "./pages/Consultations";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import PaymentCallback from "./pages/PaymentCallback";
import OrderTracking from "./pages/OrderTracking";
import Wishlist from "./pages/Wishlist";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/packages" element={<Shop />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/signup" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/buy-coins" element={<BuyCoins />} />
                <Route path="/consultations" element={<Consultations />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/payment/callback" element={<PaymentCallback />} />
                <Route path="/order/:orderId" element={<OrderTracking />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/about" element={<About />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
