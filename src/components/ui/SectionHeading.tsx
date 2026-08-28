import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  blurb?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  blurb,
  align = "left",
  className,
}: Props) {
  return (
    <div
      className={cn(
        align === "center" && "mx-auto max-w-2xl text-center",
        className,
      )}
    >
      {eyebrow && <p className="eyebrow text-leather">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl sm:text-4xl">{title}</h2>
      {blurb && (
        <p className="text-ink-70 mt-4 leading-relaxed">{blurb}</p>
      )}
    </div>
  );
}
