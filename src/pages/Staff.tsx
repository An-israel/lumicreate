import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  Eye, 
  Search, 
  Mail,
  LayoutDashboard,
  LogOut,
  Home,
  Truck
} from "lucide-react";
import { Order, Product, Consultation } from "@/types/database";
import { ORDER_STATUSES, formatNaira } from "@/lib/constants";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

const navItems = [
  { label: "Dashboard", href: "/staff", icon: LayoutDashboard, tab: "overview" },
  { label: "Orders", href: "/staff?tab=orders", icon: ShoppingCart, tab: "orders" },
  { label: "Products", href: "/staff?tab=products", icon: Package, tab: "products" },
  { label: "Consultations", href: "/staff?tab=consultations", icon: Users, tab: "consultations" },
  { label: "Subscribers", href: "/staff?tab=subscribers", icon: Mail, tab: "subscribers" },
];

export default function Staff() {
  const { isStaff, isAdmin, isLoading: authLoading, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [trackingId, setTrackingId] = useState("");

  useEffect(() => {
    if (!authLoading) {
      // If user is admin, redirect to admin page
      if (isAdmin) {
        navigate("/admin");
        return;
      }
      // If user is not staff at all, redirect home
      if (!isStaff) {
        navigate("/");
        toast.error("Access denied. Staff only.");
      }
    }
  }, [isStaff, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isStaff && !isAdmin) {
      fetchData();
    }
  }, [isStaff, isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    const [ordersRes, productsRes, consultationsRes, subscribersRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("consultations").select("*").order("scheduled_date", { ascending: true }),
      supabase.from("newsletter_subscribers").select("*").order("subscribed_at", { ascending: false }),
    ]);

    if (ordersRes.data) setOrders(ordersRes.data as Order[]);
    if (productsRes.data) setProducts(productsRes.data as Product[]);
    if (consultationsRes.data) setConsultations(consultationsRes.data as Consultation[]);
    if (subscribersRes.data) setSubscribers(subscribersRes.data as NewsletterSubscriber[]);
    setIsLoading(false);
  };

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update order status");
    } else {
      toast.success("Order status updated");
      fetchData();
    }
  };

  const addTrackingId = async () => {
    if (!selectedOrder || !trackingId.trim()) return;

    const { error } = await supabase
      .from("orders")
      .update({ tracking_id: trackingId.trim() })
      .eq("id", selectedOrder.id);

    if (error) {
      toast.error("Failed to add tracking ID");
    } else {
      toast.success("Tracking ID added successfully");
      setTrackingDialogOpen(false);
      setTrackingId("");
      setSelectedOrder(null);
      fetchData();
    }
  };

  const updateConsultationStatus = async (consultationId: string, status: Consultation["status"]) => {
    const { error } = await supabase
      .from("consultations")
      .update({ status })
      .eq("id", consultationId);

    if (error) {
      toast.error("Failed to update consultation status");
    } else {
      toast.success("Consultation status updated");
      fetchData();
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubscribers = subscribers.filter(
    (sub) => sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex">
        <aside className="w-64 bg-background border-r flex flex-col">
          <div className="p-6 border-b">
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          </div>
        </aside>
        <main className="flex-1 p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!isStaff || isAdmin) return null;

  const stats = [
    { label: "Total Orders", value: orders.length, icon: ShoppingCart },
    { label: "Products", value: products.length, icon: Package },
    { label: "Consultations", value: consultations.length, icon: Users },
    { label: "Subscribers", value: subscribers.filter(s => s.is_active).length, icon: Mail },
  ];

  const renderContent = () => {
    switch (currentTab) {
      case "orders":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Orders</h2>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{format(new Date(order.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>{formatNaira(order.total_naira)}</TableCell>
                      <TableCell>
                        {order.tracking_id ? (
                          <span className="text-sm font-mono">{order.tracking_id}</span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setTrackingDialogOpen(true);
                            }}
                          >
                            <Truck className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={ORDER_STATUSES[order.status]?.color || "bg-gray-500"}>
                          {ORDER_STATUSES[order.status]?.label || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value as Order["status"])}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        );

      case "products":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Products</h2>
            <p className="text-sm text-muted-foreground">View only. Contact admin to add or edit products.</p>

            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price (₦)</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatNaira(product.price_naira)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {product.tier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.in_stock ? "default" : "destructive"}>
                          {product.in_stock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        );

      case "consultations":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Consultations</h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Coins Paid</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultations.map((consultation) => (
                    <TableRow key={consultation.id}>
                      <TableCell>{format(new Date(consultation.scheduled_date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{consultation.scheduled_time}</TableCell>
                      <TableCell className="capitalize">{consultation.consultation_type.replace(/_/g, " ")}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            consultation.status === "completed"
                              ? "default"
                              : consultation.status === "cancelled"
                              ? "destructive"
                              : "secondary"
                          }
                          className="capitalize"
                        >
                          {consultation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{consultation.coins_paid} coins</TableCell>
                      <TableCell>
                        <Select
                          value={consultation.status}
                          onValueChange={(value) => updateConsultationStatus(consultation.id, value as Consultation["status"])}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        );

      case "subscribers":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Newsletter Subscribers</h2>
            <p className="text-sm text-muted-foreground">View only. Contact admin to manage subscribers.</p>

            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscribers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>{format(new Date(subscriber.subscribed_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant={subscriber.is_active ? "default" : "secondary"}>
                          {subscriber.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        );

      default: // overview
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Staff Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                      </div>
                      <stat.icon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(order.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Badge className={ORDER_STATUSES[order.status]?.color || "bg-gray-500"}>
                          {ORDER_STATUSES[order.status]?.label || order.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Upcoming Consultations</h3>
                  <div className="space-y-4">
                    {consultations
                      .filter((c) => c.status === "pending" || c.status === "confirmed")
                      .slice(0, 5)
                      .map((consultation) => (
                        <div key={consultation.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium capitalize">
                              {consultation.consultation_type.replace(/_/g, " ")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(consultation.scheduled_date), "MMM d, yyyy")} at {consultation.scheduled_time}
                            </p>
                          </div>
                          <Badge variant="secondary" className="capitalize">
                            {consultation.status}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">Luminate Staff</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {profile?.full_name || "Staff Member"}
          </p>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground mt-2">
            Staff
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.tab || 
              (item.tab === "overview" && !searchParams.get("tab") && location.pathname === "/staff");
            
            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t space-y-2">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Home className="h-4 w-4" />
              Back to Site
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-destructive hover:text-destructive"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>

      {/* Tracking ID Dialog */}
      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tracking ID</DialogTitle>
            <DialogDescription>
              Add shipping tracking ID for order {selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tracking-id">Tracking ID</Label>
              <Input
                id="tracking-id"
                placeholder="Enter tracking ID..."
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addTrackingId} disabled={!trackingId.trim()}>
              <Truck className="h-4 w-4 mr-2" />
              Save Tracking ID
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
