import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Package, Eye, ChevronRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { formatNaira, ORDER_STATUSES } from "@/lib/constants";

const Orders = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { orders, isLoading: ordersLoading } = useOrders();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-muted/30 min-h-screen py-8 md:py-12">
        <div className="container max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-semibold text-foreground">
                My Orders
              </h1>
              <p className="text-muted-foreground mt-1">
                Track and manage your orders
              </p>
            </div>
            <Button asChild>
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>

          {ordersLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusInfo = ORDER_STATUSES[order.status] || { label: order.status, color: "bg-gray-500" };
                
                return (
                  <Card key={order.id} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div className="flex-1 p-4 sm:p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-foreground">{order.order_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString("en-NG", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <Badge className={`${statusInfo.color} text-white border-0`}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-medium">{formatNaira(order.total_naira)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Payment</p>
                            <p className="font-medium capitalize">{order.payment_method}</p>
                          </div>
                          {order.tracking_id && (
                            <div>
                              <p className="text-muted-foreground">Tracking</p>
                              <p className="font-medium font-mono text-xs">{order.tracking_id}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end p-4 sm:p-6 border-t sm:border-t-0 sm:border-l border-border bg-muted/30">
                        <Button variant="ghost" asChild>
                          <Link to={`/order/${order.id}`} className="gap-2">
                            <Eye className="h-4 w-4" />
                            View Details
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16">
                <div className="text-center">
                  <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start shopping to see your orders here
                  </p>
                  <Button asChild>
                    <Link to="/shop">Browse Equipment</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
