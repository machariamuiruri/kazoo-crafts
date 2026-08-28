import { CONTENT_NEEDED, isDraftVisible, type ContentKey } from "@/lib/draft";

/**
 * Wraps a section that is still waiting on real content.
 *
 * Renders nothing for real visitors. In development — or on a preview with
 * NEXT_PUBLIC_SHOW_DRAFT_CONTENT=1 — renders the section behind a banner
 * listing exactly what needs answering.
 *
 * Deliberately server-safe (no "use client"): gating happens at render time so
 * unfinished markup is never sent to the browser at all, rather than hidden
 * with CSS where anyone could read it in the page source.
 */
export function Draft({
  needs,
  label,
  children,
}: {
  needs: ContentKey;
  /** Short name of the section, shown in the banner. */
  label: string;
  children: React.ReactNode;
}) {
  if (!isDraftVisible()) return null;

  return (
    <div className="border-gold/50 bg-gold/[0.07] relative rounded-sm border-2 border-dashed p-4 sm:p-6">
      <p className="eyebrow text-leather mb-3">
        Needs content — not shown to visitors
      </p>
      <p className="text-ink mb-2 text-sm font-semibold">{label}</p>
      <ul className="text-ink-70 mb-5 space-y-1.5 text-sm">
        {CONTENT_NEEDED[needs].map((question) => (
          <li key={question} className="flex gap-2">
            <span aria-hidden="true" className="text-gold">
              ?
            </span>
            <span>{question}</span>
          </li>
        ))}
      </ul>
      <div className="border-gold/30 border-t pt-5 opacity-60">{children}</div>
    </div>
  );
}

/**
 * Banner shown once per page when draft content is visible, so it's obvious
 * you're looking at a preview rather than the live site.
 */
export function DraftModeNotice() {
  if (!isDraftVisible()) return null;

  return (
    <div className="bg-leather text-cream px-4 py-2 text-center text-xs tracking-wide">
      Draft mode — sections marked “needs content” are hidden from real
      visitors.
    </div>
  );
}
