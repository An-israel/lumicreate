import { Link } from "react-router-dom";
import { UserPlus, Lock, Sparkles, ShoppingCart, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";

interface AuthRequiredProps {
  title?: string;
  description?: string;
  feature?: "quiz" | "cart" | "orders" | "general";
  returnPath?: string;
}

const AuthRequired = ({ 
  title,
  description, 
  feature = "general",
  returnPath 
}: AuthRequiredProps) => {
  const features = {
    quiz: {
      icon: Sparkles,
      title: "Sign In to See Your Results",
      description: "Create an account to view your personalized equipment recommendations, save them for later, and get exclusive deals.",
      benefits: [
        "View personalized product recommendations",
        "Save your quiz results for later",
        "Get exclusive discounts on recommended items",
        "Track your purchases and orders"
      ]
    },
    cart: {
      icon: ShoppingCart,
      title: "Sign In to Start Shopping",
      description: "Create an account to add items to your cart and enjoy exclusive benefits.",
      benefits: [
        "Add items to your cart",
        "Save items for later",
        "Track your orders in real-time",
        "Access exclusive member deals"
      ]
    },
    orders: {
      icon: Gift,
      title: "Sign In to View Orders",
      description: "Access your order history and tracking information.",
      benefits: [
        "View all your past orders",
        "Track shipments in real-time",
        "Easy reorders",
        "Download invoices"
      ]
    },
    general: {
      icon: Lock,
      title: "Sign In Required",
      description: "Please sign in to access this feature.",
      benefits: [
        "Access exclusive member benefits",
        "Track orders and deliveries",
        "Personalized recommendations",
        "Save your favorites"
      ]
    }
  };

  const config = features[feature];
  const Icon = config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  // Build return URL
  const returnTo = returnPath || (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/");

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <div className="container max-w-lg">
          <Card className="overflow-hidden">
            <CardContent className="pt-8 pb-8 text-center">
              {/* Icon */}
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-muted mb-6">
                <Icon className="h-6 w-6" strokeWidth={1.5} />
              </div>

              {/* Title & Description */}
              <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-3">{displayTitle}</h1>
              <p className="text-muted-foreground mb-6">{displayDescription}</p>

              {/* Benefits */}
              <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  Member benefits
                </p>
                <ul className="space-y-2">
                  {config.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-foreground mt-0.5">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3">
                <Button size="lg" className="w-full gap-2" asChild>
                  <Link to={`/auth?mode=signup&returnTo=${encodeURIComponent(returnTo)}`}>
                    <UserPlus className="h-4 w-4" />
                    Create Free Account
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link to={`/auth?mode=login&returnTo=${encodeURIComponent(returnTo)}`}>
                    Already have an account? Sign In
                  </Link>
                </Button>
              </div>

              {/* Promo */}
              <div className="mt-6 p-3 rounded-xl border border-border">
                <p className="text-sm text-foreground">
                  <span className="font-medium">🎉 New users get exclusive deals!</span>
                  <br />
                  <span className="text-muted-foreground">Sign up and start shopping today</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AuthRequired;
