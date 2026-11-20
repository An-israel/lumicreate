import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <Layout>
      <div className="bg-muted/30 min-h-screen py-12 md:py-16">
        <div className="container max-w-3xl">
          <h1 className="font-display text-4xl font-semibold text-foreground mb-2">
            Terms of Service
          </h1>
          <p className="text-muted-foreground mb-8">
            Last updated: December 2024
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Luminate Creators. These Terms of Service ("Terms") govern your use of our website 
                and services. By accessing or using our platform, you agree to be bound by these Terms. 
                If you do not agree to these Terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                Luminate Creators provides content creation equipment, curated packages, and consultation 
                services to content creators. We reserve the right to modify, suspend, or discontinue any 
                part of our services at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Account Registration</h2>
              <p className="text-muted-foreground leading-relaxed">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Orders and Payments</h2>
              <p className="text-muted-foreground leading-relaxed">
                When you place an order:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Prices are in Nigerian Naira (₦) unless otherwise stated</li>
                <li>Payment must be completed before order processing</li>
                <li>We accept payments via Paystack (cards, bank transfer, USSD)</li>
                <li>We reserve the right to cancel orders for any reason</li>
                <li>Delivery times are estimates and not guaranteed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Returns and Refunds</h2>
              <p className="text-muted-foreground leading-relaxed">
                Products may be returned within 7 days of delivery if:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>The product is defective or damaged</li>
                <li>The wrong product was delivered</li>
                <li>The product is in its original, unopened packaging</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Refunds will be processed within 14 business days after we receive and inspect the returned item.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Consultations</h2>
              <p className="text-muted-foreground leading-relaxed">
                Consultation bookings are subject to availability. Cancellations must be made at least 24 hours 
                before the scheduled time for a full refund. No-shows will not be refunded.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, Luminate Creators shall not be liable for any indirect, 
                incidental, special, or consequential damages arising from your use of our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about these Terms, please contact us at{" "}
                <a href="mailto:hello@luminatecreators.com" className="text-primary hover:underline">
                  hello@luminatecreators.com
                </a>{" "}
                or visit our <Link to="/about" className="text-primary hover:underline">About page</Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
