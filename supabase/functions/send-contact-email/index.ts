import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-contact-email function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactRequest = await req.json();

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate input lengths
    if (name.length > 100 || email.length > 255 || subject.length > 200 || message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Input exceeds maximum length" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Escape HTML to prevent XSS in emails
    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const safeName = escapeHtml(name);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    // Send notification email to admin
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Luminate Creators <onboarding@resend.dev>",
        to: ["hello@luminatecreators.com"], // Replace with actual admin email
        subject: `New Contact Form: ${safeSubject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0066FF 0%, #00E5FF 100%); padding: 20px; border-radius: 10px 10px 0 0;">
              <h2 style="color: white; margin: 0;">New Contact Form Submission</h2>
            </div>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 10px 10px;">
              <p><strong>Name:</strong> ${safeName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Subject:</strong> ${safeSubject}</p>
              <p><strong>Message:</strong></p>
              <div style="background: white; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${safeMessage}</div>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">This message was sent from the Luminate Creators website contact form.</p>
          </div>
        `,
      }),
    });

    const adminResult = await adminEmailResponse.json();
    console.log("Admin notification email result:", adminResult);

    // Send confirmation email to user
    const userEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Luminate Creators <onboarding@resend.dev>",
        to: [email],
        subject: "We received your message!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0066FF 0%, #00E5FF 100%); padding: 20px; border-radius: 10px 10px 0 0;">
              <h2 style="color: white; margin: 0;">Thank you for reaching out, ${safeName}!</h2>
            </div>
            <div style="padding: 20px;">
              <p>We've received your message and will get back to you within 24-48 hours.</p>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px;"><strong>Your message:</strong></p>
                <p style="margin: 0;"><strong>Subject:</strong> ${safeSubject}</p>
                <div style="margin-top: 10px; white-space: pre-wrap;">${safeMessage}</div>
              </div>
              
              <p>In the meantime, feel free to:</p>
              <ul>
                <li>Browse our <a href="https://luminatecreators.com/shop" style="color: #0066FF;">equipment catalog</a></li>
                <li>Check out our <a href="https://luminatecreators.com/packages" style="color: #0066FF;">curated packages</a></li>
                <li>Book a <a href="https://luminatecreators.com/consultations" style="color: #0066FF;">consultation</a></li>
              </ul>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>The Luminate Creators Team</strong></p>
            </div>
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee;">
              <p>© ${new Date().getFullYear()} Luminate Creators. All rights reserved.</p>
            </div>
          </div>
        `,
      }),
    });

    const userResult = await userEmailResponse.json();
    console.log("User confirmation email result:", userResult);

    return new Response(
      JSON.stringify({ success: true, message: "Message sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send message" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
