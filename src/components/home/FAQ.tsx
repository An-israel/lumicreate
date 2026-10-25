import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { usePageContent, useSectionVisibility } from "@/hooks/usePageContent";

const defaultFaqs = [
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major payment methods through Paystack including credit/debit cards, bank transfers, and USSD. All payments are processed securely.",
  },
  {
    question: "What areas do you deliver to?",
    answer: "We deliver nationwide across Nigeria! Lagos orders typically arrive within 24 hours, while other major cities take 2-3 business days. Remote areas may take 4-5 business days. You'll receive tracking information once your order ships.",
  },
  {
    question: "Can I book a consultation before buying?",
    answer: "Absolutely! Our consultation service helps you choose the right equipment for your content type and budget. Book a session with our experts who understand the Nigerian creator landscape.",
  },
  {
    question: "What if I'm not satisfied with my purchase?",
    answer: "We offer a 7-day return policy for unused items in original packaging. If there's any issue with your equipment, contact us via WhatsApp and we'll make it right. Your satisfaction is our priority.",
  },
  {
    question: "Do you offer payment plans or installments?",
    answer: "Currently, we support full payments via Paystack (cards, bank transfer, USSD). We're working on adding installment options in the future.",
  },
  {
    question: "What content types are your packages designed for?",
    answer: "Our packages cover YouTube videos, TikTok/Reels, podcasting, live streaming, photography, and general content creation. Each package is labeled with compatible content types so you can find your perfect match.",
  },
];

const FAQ = () => {
  const { content } = usePageContent("home", "faq");
  const { isSectionVisible } = useSectionVisibility("home");

  // Don't render if section is hidden
  if (!isSectionVisible("faq")) {
    return null;
  }

  const title = content?.title || "Frequently Asked Questions";
  const subtitle = content?.subtitle || "Everything you need to know about Luminate Creators";
  
  // Use CMS FAQs if available, otherwise use defaults
  const faqs = content?.questions?.length > 0 ? content.questions : defaultFaqs;

  return (
    <section id="faq" className="section border-t border-border scroll-mt-16">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Section Header */}
          <div className="lg:col-span-4">
            <p className="eyebrow mb-3">FAQ</p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {subtitle}
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="w-full border-t border-border lg:col-span-8">
            {faqs.map((faq: { question: string; answer: string }, index: number) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="py-5 text-left text-base font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pr-8 text-[15px] leading-relaxed text-muted-foreground">
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
