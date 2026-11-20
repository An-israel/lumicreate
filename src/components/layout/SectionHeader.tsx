import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  action?: ReactNode;
  className?: string;
}

const SectionHeader = ({ eyebrow, title, subtitle, align = "center", action, className }: SectionHeaderProps) => {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "mb-12 md:mb-16",
        centered ? "mx-auto max-w-2xl text-center" : "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className={cn(!centered && "max-w-xl")}>
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h2 className="font-serif-display text-4xl text-foreground sm:text-5xl md:text-[3.5rem] md:leading-[1.05]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default SectionHeader;
