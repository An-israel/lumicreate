import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Package, Truck, ArrowRight, ShoppingBag, Coins, Copy, Check, Share2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrder } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { formatNaira, formatCoins } from "@/lib/constants";
import { toast } from "sonner";
import { format } from "date-fns";
import confetti from "canvas-confetti";

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const { order, orderItems, isLoading } = useOrder(orderId);
  const { user, wallet } = useAuth();
  const [copied, setCopied] = useState(false);

  const isNewOrder = searchParams.get("new") === "true";

  // Celebration effect for new orders
  useEffect(() => {
    if (isNewOrder && order) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isNewOrder, order]);

  const handleCopyOrderNumber = async () => {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      toast.success("Order number copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 py-12">
          <div className="container max-w-3xl">
            <div className="text-center mb-8">
              <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
              <Skeleton className="h-10 w-64 mx-auto mb-2" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <Skeleton className="h-64 w-full mb-6" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center py-12">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
              <p className="text-muted-foreground mb-4">
                We couldn't find this order. Please check your order history.
              </p>
              <Button asChild>
                <Link to="/orders">View Orders</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 py-12">
        <div className="container max-w-3xl">
          {/* Success Header */}
          <div className="text-center mb-10">
            <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-emerald-500/10 mb-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Order Placed Successfully!
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Thank you for your order. We'll start processing it right away.
            </p>
          </div>

          {/* Order Number Card */}
          <Card className="mb-6 bg-gradient-to-r from-primary/5 via-background to-accent/5 border-primary/20">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                  <p className="text-2xl font-bold font-mono text-foreground">{order.order_number}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyOrderNumber}>
                    {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/order/${order.id}`}>
                      <Truck className="h-4 w-4 mr-1" />
                      Track
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card className="mb-6">
            <CardContent className="py-6">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
              
              {/* Order Items */}
              <div className="space-y-3 mb-6">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatNaira(item.price_naira * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatNaira(order.total_naira)}</span>
                </div>
                {order.coins_used && order.coins_used > 0 && (
                  <div className="flex justify-between text-sm text-coin">
                    <span className="flex items-center gap-1">
                      <Coins className="h-4 w-4" />
                      Coins Applied
                    </span>
                    <span>-{formatCoins(order.coins_used)} coins</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-emerald-600">Free</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Paid</span>
                  <span>{formatNaira(order.naira_paid || 0)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Order Date</p>
                  <p className="font-medium">{format(new Date(order.created_at), "MMM d, yyyy h:mm a")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">{order.payment_method}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="secondary" className="mt-1 capitalize">
                    {order.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Estimated Delivery</p>
                  <p className="font-medium">3-5 Business Days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card className="mb-6">
            <CardContent className="py-6">
              <h2 className="font-semibold text-lg mb-4">What's Next?</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Order Confirmation Email</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive an email with your order details shortly.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Processing & Packaging</p>
                    <p className="text-sm text-muted-foreground">
                      We'll prepare your items for shipment within 24-48 hours.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Shipping Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Track your order in real-time once it's on its way.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coin Balance Reminder */}
          {wallet && (
            <Card className="mb-6 bg-gradient-to-r from-coin/5 via-background to-coin/5 border-coin/20">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Coins className="h-6 w-6 text-coin" />
                    <div>
                      <p className="font-medium">Your Coin Balance</p>
                      <p className="text-2xl font-bold text-coin">{formatCoins(wallet.balance)} coins</p>
                    </div>
                  </div>
                  <Button variant="outline" asChild className="border-coin/50 text-coin hover:bg-coin/10">
                    <Link to="/buy-coins">Buy More Coins</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to={`/order/${order.id}`} className="gap-2">
                <Truck className="h-5 w-5" />
                Track Your Order
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/shop" className="gap-2">
                <ShoppingBag className="h-5 w-5" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
