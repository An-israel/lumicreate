import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Package, Search, Loader2 } from "lucide-react";

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim()) {
      toast({
        title: "Order number required",
        description: "Please enter your order number to track your order.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: order, error } = await supabase
        .from("orders")
        .select("id")
        .eq("order_number", orderNumber.trim().toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (!order) {
        toast({
          title: "Order not found",
          description: "We couldn't find an order with that number. Please check and try again.",
          variant: "destructive",
        });
        return;
      }

      navigate(`/order/${order.id}`);
    } catch (error) {
      console.error("Track order error:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-12 md:py-24">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">Track Your Order</h1>
            <p className="text-muted-foreground">
              Enter your order number to see the current status of your delivery.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Order Tracking</CardTitle>
              <CardDescription>
                Your order number can be found in your order confirmation email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrackOrder} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input
                    id="orderNumber"
                    placeholder="e.g. LUM-ABC123"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="uppercase"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Track Order
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Need help? Contact our support team via WhatsApp or email.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default TrackOrder;
