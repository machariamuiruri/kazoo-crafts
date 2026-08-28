"use client";

import { useEffect, useRef } from "react";
import { Draft } from "@/components/ui/Draft";

/**
 * "How to measure" guidance, opened from beside the size selector.
 *
 * The measuring *method* below is written out in full: it's a physical
 * procedure, true regardless of who made the shoe, so it isn't a claim about
 * Kazoo Crafts and is safe to publish.
 *
 * The size *conversion* is not. Which EU number corresponds to which insole
 * length depends on the lasts Frank builds on, so it can't be copied from a
 * generic chart — get it wrong and customers order the wrong size. That table
 * stays behind <Draft> until he supplies the real measurements.
 */
export function SizeGuide({
  open,
  onClose,
  isBaby,
}: {
  open: boolean;
  onClose: () => void;
  /** Baby shoes get a slightly different instruction set. */
  isBaby: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close on Escape, and move focus into the dialog when it opens.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-guide-title"
        className="bg-cream max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-sm p-6 sm:rounded-sm sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="size-guide-title" className="text-2xl">
            How to measure
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close size guide"
            className="hover:text-leather -mt-1 -mr-1 p-2 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <ol className="mt-6 space-y-4 text-sm leading-relaxed">
          {(isBaby ? BABY_STEPS : ADULT_STEPS).map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="text-gold font-serif text-lg leading-none">
                {i + 1}
              </span>
              <span className="text-ink-70">{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-8">
          <Draft needs="sizeConversion" label="EU size → insole length (cm)">
            <p className="text-ink-70 text-sm">
              The conversion table goes here, once measured off your lasts.
            </p>
          </Draft>
        </div>

        <p className="text-ink-50 mt-6 text-sm leading-relaxed">
          Not sure between two sizes? Message us on WhatsApp with your
          measurement and we&rsquo;ll advise.
        </p>
      </div>
    </div>
  );
}

const ADULT_STEPS = [
  "Stand on a sheet of paper with your heel against a wall.",
  "Mark the paper at the tip of your longest toe — this isn't always the big toe.",
  "Measure from the wall edge of the paper to that mark, in centimetres.",
  "Measure both feet and use the larger one. Most people have a size difference between them.",
  "Measure at the end of the day, when your feet are at their largest, and while wearing the socks you'd wear with the shoes.",
];

const BABY_STEPS = [
  "Lay the paper flat and stand or sit your baby on it with the heel at the edge.",
  "Mark the paper at the tip of the longest toe, keeping the foot flat rather than curled.",
  "Measure from the paper's edge to the mark, in centimetres.",
  "Measure both feet and use the larger one.",
  "Babies grow quickly — re-measure every couple of months rather than sizing up in advance.",
];
