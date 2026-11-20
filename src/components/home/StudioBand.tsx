import { Quote } from "lucide-react";
import { usePageContent, useSectionVisibility } from "@/hooks/usePageContent";

const defaultStats = [
  { value: "500+", label: "Creators equipped" },
  { value: "2,000+", label: "Products delivered" },
  { value: "4.9/5", label: "Average rating" },
  { value: "24hrs", label: "Lagos delivery" },
];

const StudioBand = () => {
  const { content } = usePageContent("home", "studio_band");
  const { isSectionVisible } = useSectionVisibility("home");

  if (!isSectionVisible("studio_band")) {
    return null;
  }

  const stats = content?.stats?.length > 0 ? content.stats : defaultStats;
  const quote =
    content?.quote ||
    "Luminate completely transformed my content quality. The package they recommended was perfect for my channel, and delivery was super fast.";
  const author = content?.quote_author || "Chioma Adeyemi";
  const role = content?.quote_role || "YouTube creator · 150K subscribers";

  return (
    <section className="surface-ink relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
      <div className="container relative section">
        <div className="grid gap-16 lg:grid-cols-12 lg:items-center">
          <figure className="lg:col-span-7">
            <Quote className="h-10 w-10 text-brand" />
            <blockquote className="mt-8 font-serif-display text-3xl leading-[1.2] md:text-[2.75rem]">
              {quote}
            </blockquote>
            <figcaption className="mt-10 flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-foreground">
                {author.split(" ").map((n: string) => n[0]).join("")}
              </span>
              <div>
                <p className="font-medium">{author}</p>
                <p className="text-sm text-ink-muted">{role}</p>
              </div>
            </figcaption>
          </figure>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.75rem] border border-ink-border bg-ink-border lg:col-span-5">
            {stats.map((stat: { value: string; label: string }) => (
              <div key={stat.label} className="bg-ink p-7 md:p-8">
                <dt className="font-serif-display text-4xl text-brand md:text-5xl">{stat.value}</dt>
                <dd className="mt-2 text-sm text-ink-muted">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default StudioBand;
