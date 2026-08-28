"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/currency";
import { SHIPPING, type ShippingZone } from "@/lib/orders";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Method = "mpesa" | "card";

type Outcome = {
  reference: string;
  message: string;
  simulated: boolean;
};

export default function CheckoutPage() {
  const { items, subtotalKes, currency, hydrated, clear } = useStore();

  const [zoneId, setZoneId] = useState<ShippingZone>("nairobi");
  const [method, setMethod] = useState<Method>("mpesa");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const zone = useMemo(
    () => SHIPPING.find((option) => option.id === zoneId)!,
    [zoneId],
  );

  // M-PESA can't settle outside Kenya, so force card when the zone changes.
  useEffect(() => {
    if (!zone.mpesaEligible && method === "mpesa") setMethod("card");
  }, [zone, method]);

  const totalKes = subtotalKes + zone.costKes;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    // Send identifiers only — the server re-prices from the catalog.
    const payload = {
      items: items.map((item) => ({
        slug: item.slug,
        finish: item.finish,
        size: item.size,
        qty: item.qty,
      })),
      zone: zoneId,
      name,
      email,
      phone,
      address,
    };

    try {
      const response = await fetch(
        method === "mpesa" ? "/api/checkout/mpesa" : "/api/checkout/card",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setOutcome({
        reference: data.reference,
        message: data.message,
        simulated: Boolean(data.simulated),
      });
      clear();
    } catch {
      setError("We couldn't reach the server. Check your connection and retry.");
    } finally {
      setSubmitting(false);
    }
  }

  if (outcome) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="eyebrow text-leather">Order received</p>
        <h1 className="mt-4 text-3xl">Reference {outcome.reference}</h1>
        <p className="text-ink-70 mt-5 leading-relaxed">{outcome.message}</p>
        {outcome.simulated && (
          <p className="border-gold/40 bg-gold/10 text-ink-70 mt-6 rounded-sm border p-4 text-left text-sm leading-relaxed">
            <strong className="text-ink">Nothing was charged.</strong> This
            environment has no payment credentials configured, so the order was
            recorded but no money moved.
          </p>
        )}
        <Button href="/shop" size="lg" className="mt-9">
          Continue shopping
        </Button>
      </div>
    );
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-ink-50 text-sm">Loading checkout…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-3xl">Nothing to check out</h1>
        <p className="text-ink-70 mt-4">Your bag is empty.</p>
        <Button href="/shop" size="lg" className="mt-8">
          Shop the collection
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-4xl">Checkout</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-10 grid gap-12 lg:grid-cols-[1.5fr_1fr]"
      >
        <div className="space-y-10">
          <fieldset>
            <legend className="eyebrow text-leather">1 · Contact</legend>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                value={name}
                onChange={setName}
                required
                autoComplete="name"
              />
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                required
                autoComplete="email"
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="eyebrow text-leather">2 · Delivery</legend>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-ink-70 text-sm">Destination</span>
                <select
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value as ShippingZone)}
                  className="border-sand focus:border-ink mt-1.5 w-full rounded-sm border bg-white px-4 py-3 text-sm outline-none"
                >
                  {SHIPPING.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label} —{" "}
                      {option.costKes === 0
                        ? "free"
                        : formatPrice(option.costKes, currency)}
                    </option>
                  ))}
                </select>
                <span className="text-ink-50 mt-1.5 block text-xs">
                  Arrives {zone.eta}
                </span>
              </label>

              <Field
                label="Delivery address"
                value={address}
                onChange={setAddress}
                required
                autoComplete="street-address"
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="eyebrow text-leather">3 · Payment</legend>
            <div className="mt-5 space-y-3">
              <MethodOption
                selected={method === "mpesa"}
                disabled={!zone.mpesaEligible}
                onSelect={() => setMethod("mpesa")}
                title="M-PESA"
                blurb={
                  zone.mpesaEligible
                    ? "You'll get a PIN prompt on your phone."
                    : "Available for deliveries within Kenya only."
                }
              />
              <MethodOption
                selected={method === "card"}
                onSelect={() => setMethod("card")}
                title="Card or PayPal"
                blurb="Visa, Mastercard and PayPal, billed in USD."
              />
            </div>

            {method === "mpesa" && (
              <div className="mt-5">
                <Field
                  label="M-PESA phone number"
                  value={phone}
                  onChange={setPhone}
                  required
                  type="tel"
                  autoComplete="tel"
                  placeholder="0712 345 678"
                />
              </div>
            )}
          </fieldset>

          {error && (
            <p
              role="alert"
              className="border-clay/40 bg-clay/10 text-clay rounded-sm border p-4 text-sm"
            >
              {error}
            </p>
          )}
        </div>

        <aside className="bg-surface border-sand h-fit rounded-sm border p-6">
          <h2 className="text-xl">Order summary</h2>

          <ul className="border-sand mt-5 space-y-3 border-b pb-5 text-sm">
            {items.map((item) => (
              <li
                key={`${item.slug}-${item.finish}-${item.size ?? ""}`}
                className="flex justify-between gap-4"
              >
                <span className="text-ink-70">
                  {item.name}
                  <span className="text-ink-50">
                    {" "}
                    × {item.qty}
                    {item.size && ` · ${item.size}`}
                  </span>
                </span>
                <span className="shrink-0">
                  {formatPrice(item.priceKes * item.qty, currency)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-70">Subtotal</dt>
              <dd>{formatPrice(subtotalKes, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-70">Shipping</dt>
              <dd>
                {zone.costKes === 0
                  ? "Free"
                  : formatPrice(zone.costKes, currency)}
              </dd>
            </div>
            <div className="border-sand flex justify-between border-t pt-3 text-base font-medium">
              <dt>Total</dt>
              <dd>{formatPrice(totalKes, currency)}</dd>
            </div>
          </dl>

          <Button
            type="submit"
            size="lg"
            className="mt-7 w-full"
            disabled={submitting}
          >
            {submitting
              ? "Processing…"
              : method === "mpesa"
                ? "Pay with M-PESA"
                : "Continue to payment"}
          </Button>

          <p className="text-ink-50 mt-4 text-center text-xs leading-relaxed">
            <Link href="/cart" className="underline underline-offset-4">
              Edit bag
            </Link>
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  autoComplete,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-ink-70 text-sm">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="border-sand focus:border-ink mt-1.5 w-full rounded-sm border bg-white px-4 py-3 text-sm outline-none"
      />
    </label>
  );
}

function MethodOption({
  selected,
  disabled,
  onSelect,
  title,
  blurb,
}: {
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  title: string;
  blurb: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-start gap-3 rounded-sm border p-4 text-left transition-colors",
        selected ? "border-ink bg-ink/[0.03]" : "border-sand hover:border-ink-50",
        disabled && "cursor-not-allowed opacity-45 hover:border-sand",
      )}
    >
      <span
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 transition-colors",
          selected ? "border-ink bg-ink" : "border-sand",
        )}
        aria-hidden="true"
      />
      <span>
        <span className="block font-medium">{title}</span>
        <span className="text-ink-50 mt-0.5 block text-sm">{blurb}</span>
      </span>
    </button>
  );
}
