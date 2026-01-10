import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, AlertTriangle, XCircle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/constants";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PaymentAlert {
  id: string;
  type: string;
  reference: string;
  amount: number | null;
  user_id: string | null;
  order_id: string | null;
  is_resolved: boolean;
  created_at: string;
}

const alertTypeConfig: Record<string, { label: string; color: string; icon: typeof AlertTriangle; bgColor: string }> = {
  failed_payment: { 
    label: "Failed Payment", 
    color: "text-destructive", 
    icon: XCircle,
    bgColor: "bg-destructive/10 border-destructive/20"
  },
  chargeback: { 
    label: "Chargeback", 
    color: "text-orange-500", 
    icon: AlertTriangle,
    bgColor: "bg-orange-500/10 border-orange-500/20"
  },
  refund: { 
    label: "Refund", 
    color: "text-blue-500", 
    icon: RefreshCw,
    bgColor: "bg-blue-500/10 border-blue-500/20"
  },
};

export default function RealtimePaymentAlerts() {
  const [alerts, setAlerts] = useState<PaymentAlert[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Fetch initial unresolved alerts
    const fetchAlerts = async () => {
      const { data, error } = await supabase
        .from("payment_alerts")
        .select("*")
        .eq("is_resolved", false)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        setAlerts(data as PaymentAlert[]);
      }
    };

    fetchAlerts();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("payment-alerts-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "payment_alerts",
        },
        (payload) => {
          const newAlert = payload.new as PaymentAlert;
          console.log("New payment alert received:", newAlert);
          
          // Show toast notification
          const config = alertTypeConfig[newAlert.type] || { 
            label: newAlert.type, 
            color: "text-muted-foreground" 
          };
          
          toast.error(`New ${config.label}!`, {
            description: `Reference: ${newAlert.reference.substring(0, 15)}...${newAlert.amount ? ` - ${formatNaira(newAlert.amount)}` : ""}`,
            duration: 10000,
          });

          // Add to alerts list
          setAlerts((prev) => [newAlert, ...prev].slice(0, 5));
          setIsVisible(true);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "payment_alerts",
        },
        (payload) => {
          const updatedAlert = payload.new as PaymentAlert;
          
          // Remove resolved alerts from the list
          if (updatedAlert.is_resolved) {
            setAlerts((prev) => prev.filter((a) => a.id !== updatedAlert.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  if (!isVisible || alerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 space-y-2 max-h-[50vh] overflow-y-auto">
      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Bell className="h-4 w-4" />
          <span>Payment Alerts</span>
          <Badge variant="destructive" className="text-xs">
            {alerts.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {alerts.map((alert) => {
        const config = alertTypeConfig[alert.type] || {
          label: alert.type,
          color: "text-muted-foreground",
          icon: AlertTriangle,
          bgColor: "bg-muted border-border",
        };
        const IconComponent = config.icon;

        return (
          <div
            key={alert.id}
            className={cn(
              "rounded-lg border p-3 shadow-lg animate-in slide-in-from-right-5",
              config.bgColor
            )}
          >
            <div className="flex items-start gap-3">
              <IconComponent className={cn("h-5 w-5 mt-0.5", config.color)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={cn("font-medium text-sm", config.color)}>
                    {config.label}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-50 hover:opacity-100"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  Ref: {alert.reference.substring(0, 20)}...
                </p>
                {alert.amount && (
                  <p className="text-sm font-semibold mt-1">
                    {formatNaira(alert.amount)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(alert.created_at), "MMM d, HH:mm")}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
