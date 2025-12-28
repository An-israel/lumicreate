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
import Packages from "./pages/Packages";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Quiz from "./pages/Quiz";
import BuyCoins from "./pages/BuyCoins";
import Consultations from "./pages/Consultations";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import PaymentCallback from "./pages/PaymentCallback";
import OrderTracking from "./pages/OrderTracking";
import TrackOrder from "./pages/TrackOrder";
import Wishlist from "./pages/Wishlist";
import About from "./pages/About";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Resources from "./pages/Resources";
import BlogPost from "./pages/BlogPost";
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
                <Route path="/packages" element={<Packages />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/signup" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/buy-coins" element={<BuyCoins />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/consultations" element={<Consultations />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/payment/callback" element={<PaymentCallback />} />
                <Route path="/order/:orderId" element={<OrderTracking />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/about" element={<About />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/resources/:slug" element={<BlogPost />} />
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
