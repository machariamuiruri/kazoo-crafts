import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-cream hover:bg-leather",
  accent: "bg-leather text-cream hover:bg-clay",
  outline: "border border-ink/25 text-ink hover:border-ink hover:bg-ink/5",
  ghost: "text-ink hover:bg-ink/5",
};

const SIZES: Record<Size, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-[0.8125rem]",
  lg: "px-8 py-4 text-sm",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium " +
  "tracking-[0.08em] uppercase transition-colors duration-200 " +
  "disabled:opacity-40 disabled:pointer-events-none";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };

type LinkProps = CommonProps & { href: string };

export function Button(props: ButtonProps | LinkProps) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const {
    variant: _variant,
    size: _size,
    className: _className,
    children: _children,
    ...rest
  } = props as ButtonProps;

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
