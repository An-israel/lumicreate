import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageContent, useSectionVisibility } from "@/hooks/usePageContent";

const CTABand = () => {
  const { content } = usePageContent("home", "cta_band");
  const { isSectionVisible } = useSectionVisibility("home");

  if (!isSectionVisible("cta_band")) {
    return null;
  }

  const title = content?.title || "Not sure where to start?";
  const subtitle =
    content?.subtitle || "Answer a few quick questions and we'll match you with the right setup for your content and budget.";
  const primaryText = content?.cta_primary_text || "Take the 2-minute quiz";
  const primaryLink = content?.cta_primary_link || "/quiz";
  const secondaryText = content?.cta_secondary_text || "Talk to an expert";
  const secondaryLink = content?.cta_secondary_link || "/consultations";

  return (
    <section className="container pb-20 md:pb-28">
      <div className="relative overflow-hidden rounded-[2rem] bg-brand px-8 py-14 text-brand-foreground md:px-16 md:py-20">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border-[40px] border-brand-foreground/5" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 right-40 h-64 w-64 rounded-full border-[30px] border-brand-foreground/5" />
        <div className="relative grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <h2 className="font-serif-display text-4xl leading-[1.05] md:text-6xl">{title}</h2>
            <p className="mt-5 max-w-lg text-lg text-brand-foreground/75">{subtitle}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:col-span-5 md:justify-end">
            <Button size="lg" asChild>
              <Link to={primaryLink}>
                {primaryText}
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-brand-foreground/25 bg-transparent text-brand-foreground hover:bg-brand-foreground/10 hover:text-brand-foreground" asChild>
              <Link to={secondaryLink}>{secondaryText}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABand;
