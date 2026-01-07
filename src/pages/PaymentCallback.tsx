import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { verifyPayment } from "@/lib/paystack";
import { Loader2, XCircle } from "lucide-react";

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshWallet } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyTransaction = async () => {
      const reference = searchParams.get("reference");
      
      if (!reference) {
        setStatus("error");
        setMessage("No payment reference found");
        return;
      }

      const result = await verifyPayment(reference);

      if (result.success) {
        setStatus("success");
        
        if (result.type === "coins") {
          await refreshWallet();
          // Redirect to dedicated success page with coin details
          navigate(`/coins/success?coins=${result.coinsAdded || 0}&bonus=${result.bonusCoins || 0}&balance=${result.newBalance || 0}`, { replace: true });
        } else if (result.type === "order") {
          // Redirect to order confirmation
          if (result.orderId) {
            navigate(`/order/${result.orderId}/confirmation?new=true`, { replace: true });
          } else {
            navigate("/orders", { replace: true });
          }
        }
      } else {
        setStatus("error");
        setMessage(result.error || result.message || "Payment verification failed");
      }
    };

    verifyTransaction();
  }, [searchParams, refreshWallet, navigate]);

  return (
    <Layout>
      <div className="container-main py-12 min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md mx-auto w-full">
          <CardContent className="pt-8 pb-8 text-center">
            {status === "loading" && (
              <>
                <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin mb-4" />
                <h2 className="text-xl font-bold mb-2">Verifying Payment</h2>
                <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
                <h2 className="text-xl font-bold mb-2">Payment Failed</h2>
                <p className="text-muted-foreground mb-6">{message}</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => navigate(-1)}>
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/")}>
                    Go Home
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
