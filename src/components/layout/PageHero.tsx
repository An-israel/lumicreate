import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** Plain, centered page intro used at the top of inner pages. */
const PageHero = ({ eyebrow, title, subtitle, children, className }: PageHeroProps) => (
  <section className={cn("relative overflow-hidden border-b border-border pt-16 pb-14 md:pt-24 md:pb-20", className)}>
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-64 w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/20 blur-3xl" />
    <div className="container relative">
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
        <h1 className="font-serif-display text-5xl text-foreground sm:text-6xl md:text-7xl md:leading-[1.02]">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </div>
  </section>
);

export default PageHero;
