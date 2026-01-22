import { Search, ShoppingBag, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const steps = [
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
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Simple Process
          </Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            From discovery to delivery, we make upgrading your setup effortless.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative group"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-px bg-border" />
              )}

              <div className="relative bg-background rounded-2xl p-6 border border-border transition-all duration-300 hover:shadow-lg hover:border-primary/30">
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <step.icon className="h-7 w-7" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
