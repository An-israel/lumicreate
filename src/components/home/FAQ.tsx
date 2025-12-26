import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the coin system work?",
    answer: "Coins are our rewards currency. You buy coins with Naira and get bonus coins on larger purchases (up to 20% extra). Use coins to pay for any product - they never expire and can be combined with direct payments if you don't have enough.",
  },
  {
    question: "What areas do you deliver to?",
    answer: "We deliver nationwide across Nigeria! Lagos orders typically arrive within 24 hours, while other major cities take 2-3 business days. Remote areas may take 4-5 business days. You'll receive tracking information once your order ships.",
  },
  {
    question: "Can I book a consultation before buying?",
    answer: "Absolutely! Our consultation service helps you choose the right equipment for your content type and budget. Book a session with our experts who understand the Nigerian creator landscape. Consultations are paid with coins.",
  },
  {
    question: "What if I'm not satisfied with my purchase?",
    answer: "We offer a 7-day return policy for unused items in original packaging. If there's any issue with your equipment, contact us via WhatsApp and we'll make it right. Your satisfaction is our priority.",
  },
  {
    question: "Do you offer payment plans or installments?",
    answer: "Currently, we support full payments via Paystack (cards, bank transfer, USSD) or coins. You can gradually accumulate coins over time to save up for bigger packages without any expiration worries.",
  },
  {
    question: "What content types are your packages designed for?",
    answer: "Our packages cover YouTube videos, TikTok/Reels, podcasting, live streaming, photography, and general content creation. Each package is labeled with compatible content types so you can find your perfect match.",
  },
];

const FAQ = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          {/* Section Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Got Questions?
            </Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about Luminate Creators
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base font-medium hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
