"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Currency } from "@/lib/currency";

export type CartItem = {
  slug: string;
  name: string;
  priceKes: number;
  finish: string;
  finishHex: string;
  size?: string;
  qty: number;
};

/** Same product in a different finish or size is a different line item. */
function lineKey(item: Pick<CartItem, "slug" | "finish" | "size">): string {
  return [item.slug, item.finish, item.size ?? ""].join("::");
}

type StoreValue = {
  items: CartItem[];
  count: number;
  subtotalKes: number;
  currency: Currency;
  /** False until localStorage has been read, so SSR and first paint agree. */
  hydrated: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  setCurrency: (currency: Currency) => void;
  keyOf: (item: Pick<CartItem, "slug" | "finish" | "size">) => string;
};

const StoreContext = createContext<StoreValue | null>(null);

const CART_KEY = "kazoo.cart.v1";
const CURRENCY_KEY = "kazoo.currency.v1";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [currency, setCurrencyState] = useState<Currency>("KES");
  const [hydrated, setHydrated] = useState(false);

  // Read persisted state after mount. Doing this during render would produce
  // server/client markup mismatches, so the first paint is always an empty cart.
  useEffect(() => {
    try {
      const rawCart = window.localStorage.getItem(CART_KEY);
      if (rawCart) {
        const parsed: unknown = JSON.parse(rawCart);
        if (Array.isArray(parsed)) setItems(parsed as CartItem[]);
      }
      const rawCurrency = window.localStorage.getItem(CURRENCY_KEY);
      if (rawCurrency === "KES" || rawCurrency === "USD") {
        setCurrencyState(rawCurrency);
      }
    } catch {
      // Corrupt or unavailable storage (private mode, quota) — start clean
      // rather than blocking the whole storefront from rendering.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      // Ignore write failures; the cart still works for this session.
    }
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CURRENCY_KEY, currency);
    } catch {
      // As above.
    }
  }, [currency, hydrated]);

  const addItem = useCallback((incoming: CartItem) => {
    setItems((current) => {
      const key = lineKey(incoming);
      const existing = current.find((item) => lineKey(item) === key);
      if (!existing) return [...current, incoming];
      return current.map((item) =>
        lineKey(item) === key ? { ...item, qty: item.qty + incoming.qty } : item,
      );
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((item) => lineKey(item) !== key));
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((current) =>
      qty <= 0
        ? current.filter((item) => lineKey(item) !== key)
        : current.map((item) =>
            lineKey(item) === key ? { ...item, qty } : item,
          ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<StoreValue>(() => {
    const count = items.reduce((sum, item) => sum + item.qty, 0);
    const subtotalKes = items.reduce(
      (sum, item) => sum + item.priceKes * item.qty,
      0,
    );
    return {
      items,
      count,
      subtotalKes,
      currency,
      hydrated,
      addItem,
      removeItem,
      setQty,
      clear,
      setCurrency: setCurrencyState,
      keyOf: lineKey,
    };
  }, [items, currency, hydrated, addItem, removeItem, setQty, clear]);

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used inside <StoreProvider>");
  }
  return context;
}
