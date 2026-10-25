import { Search, ShoppingBag, Truck } from "lucide-react";
import SectionHeader from "@/components/layout/SectionHeader";
import { usePageContent, useSectionVisibility } from "@/hooks/usePageContent";

const defaultSteps = [
  {
    number: "01",
    icon: Search,
    title: "Find Your Fit",
    description: "Take our quick quiz or browse curated packages designed for your content type and budget.",
  },
  {
    number: "02",
    icon: ShoppingBag,
    title: "Shop & Pay",
    description: "Browse equipment packages or individual items. Pay securely with Paystack.",
  },
  {
    number: "03",
    icon: Truck,
    title: "Create & Shine",
    description: "Get fast delivery in Lagos (24hrs) and nationwide. Set up with our guides and start creating!",
  },
];

const HowItWorks = () => {
  const { content } = usePageContent("home", "how_it_works");
  const { isSectionVisible } = useSectionVisibility("home");

  // Don't render if section is hidden
  if (!isSectionVisible("how_it_works")) {
    return null;
  }

  const title = content?.title || "How It Works";
  const subtitle = content?.subtitle || "From discovery to delivery, we make upgrading your setup effortless.";
  
  // Use CMS steps if available, otherwise use defaults
  const steps = content?.steps?.length > 0
    ? content.steps.map((step: any, index: number) => ({
        number: String(index + 1).padStart(2, "0"),
        icon: [Search, ShoppingBag, Truck][index] || Search,
        title: step.title,
        description: step.description,
      }))
    : defaultSteps;

  return (
    <section className="section bg-muted/40">
      <div className="container">
        <SectionHeader eyebrow="How it works" title={title} subtitle={subtitle} />

        {/* Steps */}
        <ol className="grid gap-10 md:grid-cols-3 md:gap-8 max-w-5xl mx-auto">
          {steps.map((step: any) => (
            <li key={step.number} className="border-t border-foreground/15 pt-6">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-sm font-medium tabular-nums">{step.number}</span>
                <step.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default HowItWorks;
