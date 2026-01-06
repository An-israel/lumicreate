import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CoinReceiptRequest {
  email: string;
  customerName?: string;
  coinsAdded: number;
  bonusCoins: number;
  totalCoins: number;
  newBalance: number;
  amountPaid: number;
  reference: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      email,
      customerName,
      coinsAdded,
      bonusCoins,
      totalCoins,
      newBalance,
      amountPaid,
      reference,
    }: CoinReceiptRequest = await req.json();

    const purchaseDate = new Date().toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; padding: 40px;">
                  <tr>
                    <td align="center" style="padding-bottom: 24px;">
                      <h1 style="color: #1f2937; font-size: 28px; font-weight: bold; margin: 0;">🪙 Coin Purchase Successful!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #374151; font-size: 16px; line-height: 24px; padding-bottom: 16px;">
                      Hi ${customerName || "Creator"},
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #374151; font-size: 16px; line-height: 24px; padding-bottom: 24px;">
                      Great news! Your Luminate Coins purchase was successful and the coins have been added to your wallet.
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f9fafb; border-radius: 8px; padding: 24px; border: 1px solid #e5e7eb;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="color: #1f2937; font-size: 18px; font-weight: bold; padding-bottom: 16px;">
                            Purchase Receipt
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Base Coins:</td>
                                <td align="right" style="color: #1f2937; font-size: 14px; padding: 8px 0;">${coinsAdded.toLocaleString()}</td>
                              </tr>
                              ${bonusCoins > 0 ? `
                              <tr>
                                <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Bonus Coins:</td>
                                <td align="right" style="color: #10b981; font-size: 14px; padding: 8px 0;">+${bonusCoins.toLocaleString()}</td>
                              </tr>
                              ` : ""}
                              <tr>
                                <td colspan="2" style="border-top: 1px solid #e5e7eb; padding-top: 12px;"></td>
                              </tr>
                              <tr>
                                <td style="color: #1f2937; font-size: 14px; font-weight: bold; padding: 8px 0;">Total Added:</td>
                                <td align="right" style="color: #8b5cf6; font-size: 14px; font-weight: bold; padding: 8px 0;">${totalCoins.toLocaleString()} coins</td>
                              </tr>
                              <tr>
                                <td colspan="2" style="border-top: 1px solid #e5e7eb; padding-top: 12px;"></td>
                              </tr>
                              <tr>
                                <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">Amount Paid:</td>
                                <td align="right" style="color: #1f2937; font-size: 14px; padding: 8px 0;">₦${amountPaid.toLocaleString()}</td>
                              </tr>
                              <tr>
                                <td style="color: #6b7280; font-size: 14px; padding: 8px 0;">New Balance:</td>
                                <td align="right" style="color: #1f2937; font-size: 18px; font-weight: bold; padding: 8px 0;">${newBalance.toLocaleString()} coins</td>
                              </tr>
                              <tr>
                                <td colspan="2" style="border-top: 1px solid #e5e7eb; padding-top: 12px;"></td>
                              </tr>
                              <tr>
                                <td style="color: #6b7280; font-size: 12px; padding: 4px 0;">Reference:</td>
                                <td align="right" style="color: #1f2937; font-size: 12px; padding: 4px 0;">${reference}</td>
                              </tr>
                              <tr>
                                <td style="color: #6b7280; font-size: 12px; padding: 4px 0;">Date:</td>
                                <td align="right" style="color: #1f2937; font-size: 12px; padding: 4px 0;">${purchaseDate}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #374151; font-size: 16px; line-height: 24px; padding: 24px 0 8px;">
                      Your coins never expire and can be used for:
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #374151; font-size: 14px; line-height: 24px; padding-left: 20px; padding-bottom: 24px;">
                      • Equipment purchases with up to 30% savings<br>
                      • Booking expert consultations<br>
                      • Exclusive member deals
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 16px 0;">
                      <a href="https://luminatecreators.com/shop" style="background-color: #8b5cf6; border-radius: 6px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 12px 32px;">
                        Start Shopping
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="color: #9ca3af; font-size: 12px; line-height: 20px; padding-top: 32px;">
                      Thank you for choosing Luminate Creators!<br>
                      <a href="https://luminatecreators.com" style="color: #8b5cf6; text-decoration: underline;">luminatecreators.com</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: "Luminate Creators <onboarding@resend.dev>",
      to: [email],
      subject: `🪙 Your ${totalCoins.toLocaleString()} Luminate Coins are ready!`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log("Coin receipt email sent:", data);

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending coin receipt email:", error);
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
