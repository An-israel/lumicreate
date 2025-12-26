import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { verifyPayment } from "@/lib/paystack";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshWallet } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState<any>(null);

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
        setDetails(result);
        
        if (result.type === "coins") {
          setMessage(`Successfully added ${result.coinsAdded} coins to your wallet!`);
          await refreshWallet();
        } else if (result.type === "order") {
          setMessage("Payment successful! Your order is being processed.");
        }
      } else {
        setStatus("error");
        setMessage(result.error || result.message || "Payment verification failed");
      }
    };

    verifyTransaction();
  }, [searchParams, refreshWallet]);

  return (
    <Layout>
      <div className="container-main py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-8 pb-8 text-center">
            {status === "loading" && (
              <>
                <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin mb-4" />
                <h2 className="text-xl font-bold mb-2">Verifying Payment</h2>
                <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Payment Successful!</h2>
                <p className="text-muted-foreground mb-6">{message}</p>
                
                {details?.type === "coins" && (
                  <p className="text-lg font-semibold text-secondary mb-4">
                    New Balance: {details.newBalance} coins
                  </p>
                )}

                <div className="flex gap-3 justify-center">
                  {details?.type === "coins" ? (
                    <>
                      <Button onClick={() => navigate("/shop")}>
                        Start Shopping
                      </Button>
                      <Button variant="outline" onClick={() => navigate("/dashboard")}>
                        View Dashboard
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => navigate("/dashboard")}>
                        View Orders
                      </Button>
                      <Button variant="outline" onClick={() => navigate("/shop")}>
                        Continue Shopping
                      </Button>
                    </>
                  )}
                </div>
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
