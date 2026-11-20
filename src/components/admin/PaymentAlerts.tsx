import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { formatNaira } from "@/lib/constants";

interface PaymentAlert {
  id: string;
  type: string;
  reference: string;
  amount: number | null;
  user_id: string | null;
  order_id: string | null;
  details: Record<string, unknown> | null;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

const alertTypeConfig: Record<string, { label: string; color: string; icon: typeof AlertTriangle }> = {
  failed_payment: { label: "Failed Payment", color: "bg-destructive", icon: XCircle },
  chargeback: { label: "Chargeback", color: "bg-orange-500", icon: AlertTriangle },
  refund: { label: "Refund", color: "bg-blue-500", icon: RefreshCw },
};

export default function PaymentAlerts() {
  const [alerts, setAlerts] = useState<PaymentAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unresolved">("unresolved");

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    setIsLoading(true);
    let query = supabase
      .from("payment_alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter === "unresolved") {
      query = query.eq("is_resolved", false);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Failed to fetch payment alerts");
    } else {
      setAlerts((data as PaymentAlert[]) || []);
    }
    setIsLoading(false);
  };

  const resolveAlert = async (alertId: string) => {
    const { error } = await supabase
      .from("payment_alerts")
      .update({ 
        is_resolved: true, 
        resolved_at: new Date().toISOString() 
      })
      .eq("id", alertId);

    if (error) {
      toast.error("Failed to resolve alert");
    } else {
      toast.success("Alert marked as resolved");
      fetchAlerts();
    }
  };

  const unresolvedCount = alerts.filter(a => !a.is_resolved).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">Payment Alerts</h2>
          {unresolvedCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              {unresolvedCount} unresolved
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "unresolved" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unresolved")}
          >
            Unresolved
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
        </div>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-success mb-4" />
            <p className="text-muted-foreground">
              {filter === "unresolved" ? "No unresolved alerts" : "No payment alerts"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => {
                const config = alertTypeConfig[alert.type] || { 
                  label: alert.type, 
                  color: "bg-gray-500", 
                  icon: AlertTriangle 
                };
                const IconComponent = config.icon;

                return (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <Badge className={config.color}>{config.label}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {alert.reference.substring(0, 20)}...
                    </TableCell>
                    <TableCell>
                      {alert.amount ? formatNaira(alert.amount) : "-"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(alert.created_at), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      {alert.is_resolved ? (
                        <Badge variant="outline" className="text-success border-success">
                          Resolved
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!alert.is_resolved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
