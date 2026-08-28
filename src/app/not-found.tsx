import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-28 text-center">
      <p className="eyebrow text-leather">404</p>
      <h1 className="mt-4 text-4xl">We couldn&rsquo;t find that</h1>
      <p className="text-ink-70 mt-5 leading-relaxed">
        The page may have moved, or the piece you were looking at is no longer
        in the range.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Button href="/shop" size="lg">
          Shop the collection
        </Button>
        <Button href="/" size="lg" variant="outline">
          Back home
        </Button>
      </div>
    </div>
  );
}
