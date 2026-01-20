import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";
import { encode as encodeHex } from "https://deno.land/std@0.190.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!paystackSecretKey) {
      throw new Error("Paystack secret key not configured");
    }

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // Verify webhook signature
    if (signature) {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(paystackSecretKey);
      const bodyData = encoder.encode(body);
      
      const key = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-512" },
        false,
        ["sign"]
      );
      
      const signatureBuffer = await crypto.subtle.sign("HMAC", key, bodyData);
      const hashBytes = encodeHex(new Uint8Array(signatureBuffer));
      const hash = new TextDecoder().decode(hashBytes);
      
      if (hash !== signature) {
        console.error("Invalid webhook signature");
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    const event = JSON.parse(body);
    console.log("Paystack webhook event:", event.event, event.data?.reference);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (event.event) {
      case "charge.success": {
        // Payment was successful - this is a BACKUP confirmation
        // Primary processing happens in paystack-verify
        const { reference, metadata } = event.data;

        if (metadata?.type === "order" && metadata?.orderId) {
          // Update order status if not already updated
          const { data: order } = await supabase
            .from("orders")
            .select("status")
            .eq("id", metadata.orderId)
            .single();

          if (order?.status === "pending") {
            await supabase
              .from("orders")
              .update({ status: "processing", paystack_reference: reference })
              .eq("id", metadata.orderId);

            console.log(`Webhook: Order ${metadata.orderId} marked as processing`);
          }
        }
        break;
      }

      case "charge.failed": {
        // Payment failed
        const { reference, metadata, amount } = event.data;
        console.log(`Payment failed for reference: ${reference}`);

        // Create alert for admin
        await supabase.from("payment_alerts").insert({
          type: "failed_payment",
          reference,
          amount: amount / 100,
          user_id: metadata?.user_id || null,
          order_id: metadata?.orderId || null,
          details: event.data,
        });

        if (metadata?.type === "order" && metadata?.orderId) {
          // Mark order as failed/cancelled
          await supabase
            .from("orders")
            .update({ status: "cancelled", notes: "Payment failed" })
            .eq("id", metadata.orderId)
            .eq("status", "pending");

          console.log(`Webhook: Order ${metadata.orderId} cancelled due to failed payment`);
        }
        break;
      }

      case "refund.processed": {
        // Refund was processed
        const { reference, amount } = event.data;
        console.log(`Refund processed for reference: ${reference}, amount: ${amount}`);

        // Create alert for admin
        await supabase.from("payment_alerts").insert({
          type: "refund",
          reference,
          amount: amount / 100,
          details: event.data,
        });
        break;
      }

      case "chargeback.create": {
        // Chargeback initiated - CRITICAL ALERT
        const { reference, amount, customer } = event.data;
        console.log(`Chargeback initiated for reference: ${reference}`);
        
        // Create alert for admin
        await supabase.from("payment_alerts").insert({
          type: "chargeback",
          reference,
          amount: amount ? amount / 100 : null,
          details: event.data,
        });

        // Send email notification to admins
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
        if (supabaseAnonKey) {
          try {
            await fetch(`${supabaseUrl}/functions/v1/send-admin-alert`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseAnonKey}`,
              },
              body: JSON.stringify({
                alertType: "chargeback",
                reference,
                amount: amount ? amount / 100 : null,
                customerEmail: customer?.email,
                details: event.data,
              }),
            });
          } catch (err) {
            console.error("Failed to send admin alert email:", err);
          }
        }
        break;
      }

      case "transfer.success":
      case "transfer.failed":
      case "transfer.reversed": {
        // Handle transfer events if needed
        console.log(`Transfer event: ${event.event}`, event.data?.reference);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
