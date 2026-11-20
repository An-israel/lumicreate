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
    <section className="section bg-muted/50">
      <div className="container">
        <SectionHeader eyebrow="How it works" title={title} subtitle={subtitle} />

        {/* Steps */}
        <ol className="grid gap-5 md:grid-cols-3 max-w-6xl mx-auto">
          {steps.map((step: any) => (
            <li key={step.number} className="group relative overflow-hidden rounded-[1.75rem] border border-border bg-card p-8 transition-colors hover:border-brand">
              <span aria-hidden className="pointer-events-none absolute right-7 top-6 font-serif-display text-6xl leading-none text-brand/40 transition-colors group-hover:text-brand/50">
                {step.number}
              </span>
              <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-brand-foreground">
                <step.icon className="h-5 w-5" />
              </span>
              <h3 className="relative mt-10 font-serif-display text-2xl text-foreground">
                {step.title}
              </h3>
              <p className="relative mt-3 leading-relaxed text-muted-foreground">
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
