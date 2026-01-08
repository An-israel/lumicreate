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
        // Payment was successful - this is a backup confirmation
        const { reference, metadata, amount, customer } = event.data;
        const userId = metadata?.user_id;

        if (metadata?.type === "coins" && userId) {
          const coinsAmount = metadata.coinsAmount || 0;
          const bonusCoins = metadata.bonusCoins || 0;
          const totalCoins = coinsAmount + bonusCoins;

          // Check if transaction was already processed
          const { data: existingTx } = await supabase
            .from("coin_transactions")
            .select("id")
            .eq("reference_id", reference)
            .single();

          if (!existingTx) {
            // Process the transaction
            const { data: wallet } = await supabase
              .from("coin_wallets")
              .select("balance")
              .eq("user_id", userId)
              .single();

            const newBalance = (wallet?.balance || 0) + totalCoins;

            await supabase
              .from("coin_wallets")
              .update({ balance: newBalance })
              .eq("user_id", userId);

            await supabase.from("coin_transactions").insert({
              user_id: userId,
              amount: totalCoins,
              type: "purchase",
              description: `Purchased ${coinsAmount} coins + ${bonusCoins} bonus (webhook)`,
              reference_id: reference,
            });

            console.log(`Webhook: Credited ${totalCoins} coins to user ${userId}`);
          } else {
            console.log(`Webhook: Transaction ${reference} already processed`);
          }
        } else if (metadata?.type === "order" && metadata?.orderId) {
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
        const { reference, metadata } = event.data;
        console.log(`Payment failed for reference: ${reference}`);

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

        // Find the original transaction
        const { data: originalTx } = await supabase
          .from("coin_transactions")
          .select("user_id, amount")
          .eq("reference_id", reference)
          .eq("type", "purchase")
          .single();

        if (originalTx) {
          // Deduct the refunded coins
          const refundedCoins = originalTx.amount;
          
          const { data: wallet } = await supabase
            .from("coin_wallets")
            .select("balance")
            .eq("user_id", originalTx.user_id)
            .single();

          const newBalance = Math.max(0, (wallet?.balance || 0) - refundedCoins);

          await supabase
            .from("coin_wallets")
            .update({ balance: newBalance })
            .eq("user_id", originalTx.user_id);

          await supabase.from("coin_transactions").insert({
            user_id: originalTx.user_id,
            amount: -refundedCoins,
            type: "refund",
            description: `Refund for transaction ${reference}`,
            reference_id: `refund_${reference}`,
          });

          console.log(`Webhook: Refunded ${refundedCoins} coins from user ${originalTx.user_id}`);
        }
        break;
      }

      case "chargeback.create": {
        // Chargeback initiated
        const { reference } = event.data;
        console.log(`Chargeback initiated for reference: ${reference}`);
        
        // You might want to flag the user or order for review
        // For now, just log it
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
