import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewsletterWelcomeRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-newsletter-welcome function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: NewsletterWelcomeRequest = await req.json();

    // Validate email
    if (!email) {
      console.error("No email provided");
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format:", email);
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Sending welcome email to:", email);

    // Send welcome email to subscriber
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Luminate Creators <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to Luminate Creators! 🎬",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #0066FF 0%, #00E5FF 100%); padding: 40px 20px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Luminate Creators! 🎬</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Your journey to professional content creation starts here</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Thanks for joining our community of Nigerian content creators! You're now part of an exclusive group receiving weekly tips on equipment, content strategy, and growing your audience.
              </p>
              
              <div style="background: #f8f9fa; border-left: 4px solid #0066FF; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                <h3 style="margin: 0 0 10px; color: #333;">What to expect:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555;">
                  <li style="margin-bottom: 8px;">📷 Equipment guides and reviews</li>
                  <li style="margin-bottom: 8px;">💡 Content creation tips and tutorials</li>
                  <li style="margin-bottom: 8px;">📈 Growth strategies for YouTube, TikTok & more</li>
                  <li style="margin-bottom: 8px;">🎁 Exclusive deals and early access to new products</li>
                </ul>
              </div>
              
              <h3 style="color: #333; margin-bottom: 15px;">Get Started Now:</h3>
              
              <div style="display: grid; gap: 15px;">
                <a href="https://luminatecreators.com/shop" style="display: block; background: #0066FF; color: white; text-decoration: none; padding: 15px 25px; border-radius: 8px; text-align: center; font-weight: bold;">
                  🛒 Browse Our Equipment
                </a>
                <a href="https://luminatecreators.com/resources" style="display: block; background: #f0f7ff; color: #0066FF; text-decoration: none; padding: 15px 25px; border-radius: 8px; text-align: center; font-weight: bold; border: 1px solid #0066FF;">
                  📚 Read Our Latest Articles
                </a>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333; margin-top: 30px;">
                Have questions? Just reply to this email - we read every message!
              </p>
              
              <p style="margin-top: 30px; color: #333;">
                Keep creating,<br>
                <strong>The Luminate Creators Team</strong>
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
              <p style="color: #666; font-size: 12px; margin: 0 0 10px;">
                You're receiving this because you subscribed to our newsletter.
              </p>
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Luminate Creators. All rights reserved.
              </p>
            </div>
          </div>
        `,
      }),
    });

    const result = await emailResponse.json();
    console.log("Email send result:", result);

    if (!emailResponse.ok) {
      console.error("Resend API error:", result);
      return new Response(
        JSON.stringify({ error: result.message || "Failed to send email" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Welcome email sent" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-newsletter-welcome function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
