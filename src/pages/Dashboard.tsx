import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Coins, ShoppingBag, Calendar, Package, ArrowRight, TrendingUp, User, Settings } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { useConsultations } from "@/hooks/useConsultations";
import { formatNaira, formatCoins, ORDER_STATUSES } from "@/lib/constants";

const Dashboard = () => {
  const { user, profile, wallet, isLoading: authLoading } = useAuth();
  const { orders, isLoading: ordersLoading } = useOrders();
  const { consultations, isLoading: consultationsLoading } = useConsultations();
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
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const recentOrders = orders?.slice(0, 3) || [];
  const upcomingConsultations = consultations?.filter(
    (c) => c.status === "pending" || c.status === "confirmed"
  ).slice(0, 3) || [];

  const coinBalance = wallet?.balance ?? 0;

  return (
    <Layout>
      <div className="bg-muted/30 min-h-screen py-8 md:py-12">
        <div className="container">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Welcome back, {profile?.full_name?.split(" ")[0] || "Creator"}!
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              Here's what's happening with your account
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            {/* Coin Balance */}
            <Card className="bg-gradient-to-br from-coin/10 via-background to-primary/5 border-coin/20">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-coin" />
                  Coin Balance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-foreground">
                      {formatCoins(coinBalance)}
                    </p>
                    <p className="text-sm text-muted-foreground">coins available</p>
                  </div>
                  <Button size="sm" asChild>
                    <Link to="/buy-coins">
                      Buy Coins
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Orders */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Active Orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-foreground">
                      {orders?.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">in progress</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/orders">View All</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Consultations */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Consultations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-foreground">
                      {upcomingConsultations.length}
                    </p>
                    <p className="text-sm text-muted-foreground">upcoming</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/consultations">Book Now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="font-semibold text-lg text-foreground mb-4">Quick Actions</h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
              <Button variant="outline" className="h-auto py-4 justify-start gap-3" asChild>
                <Link to="/shop">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Browse Equipment</p>
                    <p className="text-xs text-muted-foreground">Find your next upgrade</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 justify-start gap-3" asChild>
                <Link to="/buy-coins">
                  <Coins className="h-5 w-5 text-coin" />
                  <div className="text-left">
                    <p className="font-medium">Buy Coins</p>
                    <p className="text-xs text-muted-foreground">Get bonus value</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 justify-start gap-3" asChild>
                <Link to="/consultations">
                  <Calendar className="h-5 w-5 text-accent" />
                  <div className="text-left">
                    <p className="font-medium">Book Consultation</p>
                    <p className="text-xs text-muted-foreground">Get expert advice</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 justify-start gap-3" asChild>
                <Link to="/orders">
                  <Package className="h-5 w-5 text-emerald-500" />
                  <div className="text-left">
                    <p className="font-medium">My Orders</p>
                    <p className="text-xs text-muted-foreground">View order history</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 justify-start gap-3" asChild>
                <Link to="/profile">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium">Profile Settings</p>
                    <p className="text-xs text-muted-foreground">Manage your account</p>
                  </div>
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent Orders</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/orders">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div>
                          <p className="font-medium text-sm">{order.order_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatNaira(order.total_naira)}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${ORDER_STATUSES[order.status]?.color} text-white border-0`}
                        >
                          {ORDER_STATUSES[order.status]?.label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No orders yet</p>
                    <Button variant="link" asChild>
                      <Link to="/shop">Start shopping</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Consultations */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Upcoming Consultations</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/consultations">Book New</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {consultationsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : upcomingConsultations.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingConsultations.map((consultation) => (
                      <div
                        key={consultation.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div>
                          <p className="font-medium text-sm capitalize">
                            {consultation.consultation_type.replace("_", " ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(consultation.scheduled_date).toLocaleDateString()} at{" "}
                            {consultation.scheduled_time}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {consultation.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No upcoming consultations</p>
                    <Button variant="link" asChild>
                      <Link to="/consultations">Book one</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
