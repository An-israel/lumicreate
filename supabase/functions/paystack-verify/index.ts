import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const { reference } = await req.json();

    // Verify transaction with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      return new Response(
        JSON.stringify({ success: false, message: "Payment verification failed" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { metadata } = verifyData.data;
    const userId = metadata.user_id;
    const customerEmail = verifyData.data.customer?.email;
    const amountPaid = verifyData.data.amount / 100; // Convert from kobo

    // Handle based on payment type
    if (metadata.type === "coins") {
      const coinsAmount = metadata.coinsAmount || 0;
      const bonusCoins = metadata.bonusCoins || 0;
      const totalCoins = coinsAmount + bonusCoins;

      // Get current wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from("coin_wallets")
        .select("balance")
        .eq("user_id", userId)
        .single();

      if (walletError) {
        throw new Error("Failed to fetch wallet");
      }

      const newBalance = (wallet?.balance || 0) + totalCoins;

      // Update wallet balance
      const { error: updateError } = await supabase
        .from("coin_wallets")
        .update({ balance: newBalance })
        .eq("user_id", userId);

      if (updateError) {
        throw new Error("Failed to update wallet balance");
      }

      // Record transaction
      await supabase.from("coin_transactions").insert({
        user_id: userId,
        amount: totalCoins,
        type: "purchase",
        description: `Purchased ${coinsAmount} coins + ${bonusCoins} bonus`,
        reference_id: reference,
      });

      // Get user profile for email personalization
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", userId)
        .single();

      // Send coin receipt email (fire and forget)
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
      
      if (customerEmail && supabaseAnonKey) {
        fetch(`${supabaseUrl}/functions/v1/send-coin-receipt`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            email: customerEmail,
            customerName: profile?.full_name,
            coinsAdded: coinsAmount,
            bonusCoins,
            totalCoins,
            newBalance,
            amountPaid,
            reference,
          }),
        }).catch(err => console.error("Failed to send receipt email:", err));
      }

      return new Response(
        JSON.stringify({
          success: true,
          type: "coins",
          coinsAdded: totalCoins,
          newBalance,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else if (metadata.type === "order") {
      const orderId = metadata.orderId;

      // Update order status
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          status: "processing",
          paystack_reference: reference,
        })
        .eq("id", orderId);

      if (orderError) {
        throw new Error("Failed to update order status");
      }

      return new Response(
        JSON.stringify({
          success: true,
          type: "order",
          orderId,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "Unknown payment type" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
