"use client";

import { formatPrice } from "@/lib/currency";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Props = {
  amountKes: number;
  /** Strike-through original price, for sale items. */
  compareAtKes?: number;
  className?: string;
};

export function Price({ amountKes, compareAtKes, className }: Props) {
  const { currency } = useStore();

  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span>{formatPrice(amountKes, currency)}</span>
      {compareAtKes !== undefined && compareAtKes > amountKes && (
        <span className="text-ink-50 text-[0.85em] line-through">
          {formatPrice(compareAtKes, currency)}
        </span>
      )}
    </span>
  );
}
