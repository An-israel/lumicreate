import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Admin emails to notify
const ADMIN_EMAILS = ["admin@luminatecreators.com"]; // Update with actual admin emails

interface AdminAlertRequest {
  alertType: "chargeback" | "refund" | "failed_payment" | "critical";
  reference: string;
  amount?: number;
  customerEmail?: string;
  details?: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { alertType, reference, amount, customerEmail, details }: AdminAlertRequest = await req.json();

    const alertTitles: Record<string, string> = {
      chargeback: "🚨 CRITICAL: Chargeback Alert",
      refund: "⚠️ Refund Processed",
      failed_payment: "❌ Payment Failed",
      critical: "🚨 Critical Alert",
    };

    const alertColors: Record<string, string> = {
      chargeback: "#DC2626",
      refund: "#F59E0B",
      failed_payment: "#EF4444",
      critical: "#DC2626",
    };

    const title = alertTitles[alertType] || "Payment Alert";
    const color = alertColors[alertType] || "#6B7280";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Alert Header -->
              <div style="background: ${color}; padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">
                  ${title}
                </h1>
              </div>
              
              <!-- Content -->
              <div style="padding: 32px;">
                <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Alert Type</td>
                      <td style="padding: 8px 0; text-align: right; font-weight: 600; text-transform: uppercase;">${alertType.replace("_", " ")}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Reference</td>
                      <td style="padding: 8px 0; text-align: right; font-weight: 600; font-family: monospace;">${reference}</td>
                    </tr>
                    ${amount ? `
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount</td>
                      <td style="padding: 8px 0; text-align: right; font-weight: 600;">₦${amount.toLocaleString()}</td>
                    </tr>
                    ` : ""}
                    ${customerEmail ? `
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Customer Email</td>
                      <td style="padding: 8px 0; text-align: right; font-weight: 600;">${customerEmail}</td>
                    </tr>
                    ` : ""}
                  </table>
                </div>
                
                ${alertType === "chargeback" ? `
                <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                  <p style="color: #DC2626; margin: 0; font-weight: 600;">⚠️ Immediate Action Required</p>
                  <p style="color: #7F1D1D; margin: 8px 0 0 0; font-size: 14px;">
                    A chargeback has been initiated. Please review this transaction immediately and gather any necessary documentation to contest if appropriate.
                  </p>
                </div>
                ` : ""}
                
                <div style="text-align: center;">
                  <a href="https://luminatecreators.com/admin?tab=alerts" 
                     style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #A78BFA); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                    View in Admin Dashboard
                  </a>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #6b7280; font-size: 12px;">
                  This is an automated alert from Luminate Creators payment system.
                </p>
                <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">
                  Timestamp: ${new Date().toISOString()}
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Luminate Alerts <alerts@luminatecreators.com>",
      to: ADMIN_EMAILS,
      subject: title,
      html: htmlContent,
    });

    console.log("Admin alert email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending admin alert:", error);
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