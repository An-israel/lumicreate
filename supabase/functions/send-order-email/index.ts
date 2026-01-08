import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  orderId: string;
  type: "confirmation" | "status_update";
  newStatus?: string;
}

const getStatusMessage = (status: string): string => {
  switch (status) {
    case "processing":
      return "We're preparing your order for shipment.";
    case "shipped":
      return "Your order is on its way! Track your package using the link below.";
    case "delivered":
      return "Your order has been delivered. Enjoy your products!";
    case "cancelled":
      return "Your order has been cancelled. If you have questions, please contact support.";
    default:
      return "Your order status has been updated.";
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-order-email function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, type, newStatus }: OrderEmailRequest = await req.json();
    console.log(`Processing ${type} email for order: ${orderId}`);

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Error fetching order:", orderError);
      throw new Error("Order not found");
    }

    // Fetch user email from auth
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(order.user_id);
    
    if (userError || !userData.user?.email) {
      console.error("Error fetching user:", userError);
      throw new Error("User email not found");
    }

    const userEmail = userData.user.email;
    console.log(`Sending email to: ${userEmail}`);

    // Fetch order items
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    // Build email content
    let subject: string;
    let heading: string;
    let message: string;

    if (type === "confirmation") {
      subject = `Order Confirmed - ${order.order_number}`;
      heading = "Thank you for your order!";
      message = "We've received your order and will begin processing it shortly.";
    } else {
      const status = newStatus || order.status;
      subject = `Order Update - ${order.order_number}`;
      heading = `Your order is now ${status}`;
      message = getStatusMessage(status);
    }

    const itemsHtml = orderItems?.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.product_name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₦${item.price_naira.toLocaleString()}</td>
      </tr>
    `).join("") || "";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #0066FF 0%, #00E5FF 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Luminate Creators</h1>
          </div>
          
          <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none;">
            <h2 style="color: #333; margin-top: 0;">${heading}</h2>
            <p style="color: #666;">${message}</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #666;">Order Number</p>
              <p style="margin: 5px 0 0; font-size: 18px; font-weight: bold; color: #333;">${order.order_number}</p>
            </div>

            ${orderItems && orderItems.length > 0 ? `
              <h3 style="color: #333; margin-top: 30px;">Order Items</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f5f5f5;">
                    <th style="padding: 12px; text-align: left; font-size: 14px;">Product</th>
                    <th style="padding: 12px; text-align: center; font-size: 14px;">Qty</th>
                    <th style="padding: 12px; text-align: right; font-size: 14px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 12px; font-weight: bold;">Total</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold;">₦${order.total_naira.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            ` : ""}

            ${order.tracking_id ? `
              <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; font-size: 14px; color: #2e7d32;">Tracking ID: <strong>${order.tracking_id}</strong></p>
              </div>
            ` : ""}

            <div style="margin-top: 30px;">
              <a href="https://luminatecreators.com/orders" 
                 style="display: inline-block; background: linear-gradient(135deg, #0066FF 0%, #00E5FF 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                Track Your Order
              </a>
            </div>
          </div>

          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Luminate Creators. All rights reserved.</p>
            <p>Need help? Contact us at support@luminatecreators.com</p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Luminate Creators <onboarding@resend.dev>",
        to: [userEmail],
        subject,
        html,
      }),
    });

    const emailResult = await emailResponse.json();

    console.log("Email sent successfully:", emailResult);

    return new Response(JSON.stringify({ success: true, emailResult }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
