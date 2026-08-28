"use client";

import { usePathname } from "next/navigation";
import { getProduct } from "@/lib/products";
import { WHATSAPP_DEFAULT_MESSAGE, whatsappUrl } from "@/lib/contact";

/**
 * Picks the opening message from where the customer currently is.
 *
 * The brand's Instagram bio says "DM to order", so WhatsApp is a real ordering
 * channel rather than a support afterthought — naming the product they're
 * looking at saves an exchange before the conversation even starts.
 */
function messageFor(pathname: string): string {
  const productMatch = pathname.match(/^\/shop\/([^/]+)$/);
  if (productMatch) {
    const product = getProduct(productMatch[1]);
    if (product) {
      return `Hi Kazoo Crafts! 👋 I'm interested in the ${product.name}. Could you tell me more about it?`;
    }
  }

  if (pathname === "/cart" || pathname === "/checkout") {
    return "Hi Kazoo Crafts! 👋 I'm placing an order on your website and I have a question.";
  }

  if (pathname.startsWith("/shop")) {
    return "Hi Kazoo Crafts! 👋 I'm browsing your collection and I'd love some help choosing a piece.";
  }

  return WHATSAPP_DEFAULT_MESSAGE;
}

/**
 * Pages where the floating button is suppressed.
 *
 * On checkout the pay button is full-width, so at some scroll positions the
 * floating button sits on top of its right-hand edge — verified on a 375px
 * viewport, where it covered ~31px of "Pay with M-PESA". A mis-tap there costs
 * a sale, and a customer at checkout means to pay rather than chat. The footer
 * link is still available on every page.
 */
const HIDDEN_ON = ["/checkout"];

export function WhatsAppButton() {
  const pathname = usePathname();

  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <a
      href={whatsappUrl(messageFor(pathname))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Kazoo Crafts on WhatsApp"
      className="group fixed right-5 bottom-5 z-40 flex items-center gap-0 rounded-full bg-[#25D366] py-3.5 pr-3.5 pl-3.5 text-white shadow-lg transition-all duration-300 ease-[var(--ease-craft)] hover:gap-2 hover:pr-5 hover:shadow-xl focus-visible:gap-2 focus-visible:pr-5 sm:right-7 sm:bottom-7"
    >
      <WhatsAppIcon />
      {/* Label expands on hover/focus so the resting state stays a clean
          circle and doesn't crowd the page on mobile. */}
      <span className="max-w-0 overflow-hidden text-sm font-medium whitespace-nowrap opacity-0 transition-all duration-300 ease-[var(--ease-craft)] group-hover:max-w-[10rem] group-hover:opacity-100 group-focus-visible:max-w-[10rem] group-focus-visible:opacity-100">
        Chat with us
      </span>
    </a>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}
