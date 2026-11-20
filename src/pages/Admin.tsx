import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/layout/AdminLayout";
import StaffManagement from "@/components/admin/StaffManagement";
import BlogManagement from "@/components/admin/BlogManagement";
import PageContentEditor from "@/components/admin/PageContentEditor";
import ProductFormDialog from "@/components/admin/ProductFormDialog";
import ProductImportDialog from "@/components/admin/ProductImportDialog";
import PaymentAlerts from "@/components/admin/PaymentAlerts";
import RealtimePaymentAlerts from "@/components/admin/RealtimePaymentAlerts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { Package, ShoppingCart, Users, Plus, Edit, FileSpreadsheet, Trash2, Eye, Search, Mail, UserX, CheckCircle, Shield, BookOpen } from "lucide-react";
import { Order, Product, Consultation } from "@/types/database";

interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}
import { ORDER_STATUSES, formatNaira } from "@/lib/constants";

export default function Admin() {
  const { isStaff, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isStaff) {
      navigate("/");
      toast.error("Access denied. Admin only.");
    }
  }, [isStaff, authLoading, navigate]);

  useEffect(() => {
    if (isStaff) {
      fetchData();
    }
  }, [isStaff]);

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
      
      // Send email notification for status update
      if (["shipped", "delivered", "cancelled"].includes(status)) {
        supabase.functions.invoke("send-order-email", {
          body: { orderId, type: "status_update", newStatus: status }
        }).catch(err => console.error("Failed to send status email:", err));
      }
      
      fetchData();
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase.from("products").delete().eq("id", productId);

    if (error) {
      toast.error("Failed to delete product");
    } else {
      toast.success("Product deleted");
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

  const toggleSubscriberStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update subscriber status");
    } else {
      toast.success(currentStatus ? "Subscriber deactivated" : "Subscriber reactivated");
      fetchData();
    }
  };

  const deleteSubscriber = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;

    const { error } = await supabase
      .from("newsletter_subscribers")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete subscriber");
    } else {
      toast.success("Subscriber deleted");
      fetchData();
    }
  };

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!isStaff) return null;

  const stats = [
    { label: "Total Orders", value: orders.length, icon: ShoppingCart },
    { label: "Products", value: products.length, icon: Package },
    { label: "Consultations", value: consultations.length, icon: Users },
    { label: "Subscribers", value: subscribers.filter(s => s.is_active).length, icon: Mail },
  ];

  // Render content based on current tab
  const renderContent = () => {
    switch (currentTab) {
      case "staff":
        return <StaffManagement />;
      
      case "blog":
        return <BlogManagement />;
      
      case "alerts":
        return <PaymentAlerts />;
      
      case "content":
        return <PageContentEditor />;
      
      case "orders":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Orders</h2>
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
                    <TableHead>Payment</TableHead>
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
                      <TableCell className="capitalize">{order.payment_method}</TableCell>
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
                          <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
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
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold">Products</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Import spreadsheet
                </Button>
                <Button onClick={() => { setEditingProduct(null); setIsProductDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
              <ProductFormDialog
                open={isProductDialogOpen}
                onOpenChange={(open) => {
                  setIsProductDialogOpen(open);
                  if (!open) setEditingProduct(null);
                }}
                product={editingProduct}
                onSaved={fetchData}
              />
              <ProductImportDialog
                open={isImportDialogOpen}
                onOpenChange={setIsImportDialogOpen}
                existingProducts={products}
                onImported={fetchData}
              />
            </div>

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
                    <TableHead>Tier</TableHead>
                    <TableHead>Price (₦)</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Actions</TableHead>
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
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.is_package && (
                              <Badge variant="secondary" className="text-xs">Package</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{product.tier}</Badge>
                      </TableCell>
                      <TableCell>{formatNaira(product.price_naira)}</TableCell>
                      <TableCell>
                        <Badge variant={product.in_stock ? "default" : "destructive"}>
                          {product.in_stock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingProduct(product);
                              setIsProductDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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
            <h2 className="text-2xl font-semibold">Consultations</h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultations.map((consultation) => (
                    <TableRow key={consultation.id}>
                      <TableCell>{format(new Date(consultation.scheduled_date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{consultation.scheduled_time}</TableCell>
                      <TableCell className="capitalize">
                        {consultation.consultation_type.replace("_", " ")}
                      </TableCell>
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
                      <TableCell>{formatNaira(consultation.coins_paid)}</TableCell>
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
            <h2 className="text-2xl font-semibold">Newsletter Subscribers</h2>
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subscribers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {subscribers.filter(s => s.is_active).length} active / {subscribers.length} total
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
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
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleSubscriberStatus(subscriber.id, subscriber.is_active)}
                            title={subscriber.is_active ? "Deactivate" : "Reactivate"}
                          >
                            {subscriber.is_active ? (
                              <UserX className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteSubscriber(subscriber.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSubscribers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No subscribers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        );

      default:
        // Overview/Dashboard
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Dashboard Overview</h2>
              <p className="text-muted-foreground">Welcome to the admin dashboard</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <stat.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-semibold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Recent Orders</h3>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{order.order_number}</span>
                        <Badge className={ORDER_STATUSES[order.status]?.color || "bg-gray-500"} variant="secondary">
                          {ORDER_STATUSES[order.status]?.label || order.status}
                        </Badge>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <p className="text-muted-foreground text-sm">No orders yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Upcoming Consultations</h3>
                  <div className="space-y-3">
                    {consultations.slice(0, 5).map((consultation) => (
                      <div key={consultation.id} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{consultation.consultation_type.replace("_", " ")}</span>
                        <span className="text-muted-foreground">
                          {format(new Date(consultation.scheduled_date), "MMM d")}
                        </span>
                      </div>
                    ))}
                    {consultations.length === 0 && (
                      <p className="text-muted-foreground text-sm">No consultations scheduled</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <AdminLayout>
      {renderContent()}

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.order_number}</DialogTitle>
            <DialogDescription>
              Order details and status
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total (Naira)</p>
                  <p className="font-medium">{formatNaira(selectedOrder.total_naira)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Naira Paid</p>
                  <p className="font-medium">{formatNaira(selectedOrder.naira_paid || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">{selectedOrder.payment_method}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={ORDER_STATUSES[selectedOrder.status]?.color || "bg-gray-500"}>
                    {ORDER_STATUSES[selectedOrder.status]?.label || selectedOrder.status}
                  </Badge>
                </div>
              </div>
              {selectedOrder.notes && (
                <div>
                  <p className="text-muted-foreground text-sm">Notes</p>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Real-time payment alerts notification */}
      <RealtimePaymentAlerts />
    </AdminLayout>
  );
}
