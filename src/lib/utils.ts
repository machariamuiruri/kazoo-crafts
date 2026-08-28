/**
 * Joins class names, dropping falsy entries.
 *
 * Deliberately not clsx/tailwind-merge — this project has no conflicting
 * utility classes being composed from outside, so the extra dependency and
 * bundle weight aren't earning anything.
 */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
