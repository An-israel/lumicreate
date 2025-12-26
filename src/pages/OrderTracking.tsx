import { useParams, Link } from "react-router-dom";
import { useOrder } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowLeft,
  ChevronRight,
  XCircle,
} from "lucide-react";
import { formatNaira } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const ORDER_STATUSES = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const getStatusIndex = (status: string) => {
  if (status === "cancelled") return -1;
  return ORDER_STATUSES.findIndex((s) => s.key === status);
};

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const { order, orderItems, isLoading, error } = useOrder(orderId);

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container-main py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-60 w-full" />
            </div>
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container-main py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
              <p className="text-muted-foreground mb-4">
                Please sign in to view your order.
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

  if (error || !order) {
    return (
      <Layout>
        <div className="container-main py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
              <p className="text-muted-foreground mb-4">
                We couldn't find this order. It may have been removed or the link is invalid.
              </p>
              <Button asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const isCancelled = order.status === "cancelled";
  const trackingHistory = (order.tracking_history as { date: string; status: string; message: string }[]) || [];

  return (
    <Layout>
      <div className="container-main py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Order {order.order_number}</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Order Tracking</h1>
            <p className="text-muted-foreground mt-1">
              Order #{order.order_number}
            </p>
          </div>
          <Badge
            variant={isCancelled ? "destructive" : order.status === "delivered" ? "default" : "secondary"}
            className="text-sm py-1 px-3"
          >
            {isCancelled ? "Cancelled" : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Status Tracker */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                {isCancelled ? (
                  <div className="flex items-center gap-4 text-destructive">
                    <XCircle className="h-8 w-8" />
                    <div>
                      <p className="font-semibold">Order Cancelled</p>
                      <p className="text-sm text-muted-foreground">
                        This order has been cancelled.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex justify-between">
                      {ORDER_STATUSES.map((status, index) => {
                        const Icon = status.icon;
                        const isActive = index <= currentStatusIndex;
                        const isCurrent = index === currentStatusIndex;

                        return (
                          <div
                            key={status.key}
                            className={cn(
                              "flex flex-col items-center text-center relative z-10",
                              isActive ? "text-primary" : "text-muted-foreground"
                            )}
                          >
                            <div
                              className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all",
                                isCurrent
                                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                                  : isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <span className={cn("text-xs font-medium", isCurrent && "text-primary")}>
                              {status.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {/* Progress Line */}
                    <div className="absolute top-6 left-6 right-6 h-0.5 bg-muted -z-0">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{
                          width: `${(currentStatusIndex / (ORDER_STATUSES.length - 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tracking History */}
            <Card>
              <CardHeader>
                <CardTitle>Tracking Updates</CardTitle>
              </CardHeader>
              <CardContent>
                {trackingHistory.length > 0 ? (
                  <div className="space-y-4">
                    {trackingHistory.map((update, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            index === 0 ? "bg-primary" : "bg-muted-foreground/30"
                          )} />
                          {index < trackingHistory.length - 1 && (
                            <div className="w-0.5 h-full bg-muted-foreground/20 my-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{update.status}</p>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(update.date), "MMM d, yyyy h:mm a")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{update.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tracking updates yet.</p>
                    <p className="text-sm">Check back soon for updates on your order.</p>
                  </div>
                )}

                {order.tracking_id && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Tracking ID</p>
                    <p className="text-lg font-mono">{order.tracking_id}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatNaira(item.price_naira)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Date</span>
                  <span>{format(new Date(order.created_at), "MMM d, yyyy")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="capitalize">{order.payment_method}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatNaira(order.total_naira)}</span>
                </div>
                {order.coins_used && order.coins_used > 0 && (
                  <div className="flex justify-between text-sm text-secondary">
                    <span>Coins Used</span>
                    <span>-{order.coins_used} coins</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Paid</span>
                  <span>{formatNaira(order.naira_paid || 0)}</span>
                </div>
              </CardContent>
            </Card>

            <Button asChild className="w-full" variant="outline">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
