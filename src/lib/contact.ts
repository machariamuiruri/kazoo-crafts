/**
 * Contact details, in one place so the number isn't scattered through the UI.
 *
 * Client-safe — deliberately holds no secrets, so it can be imported from
 * "use client" components.
 */

/**
 * WhatsApp number in international form: no `+`, no spaces, no leading zero.
 * wa.me rejects anything else. 0714 085 668 → 254714085668.
 */
export const WHATSAPP_NUMBER = "254714085668";

/** Same number, formatted for display to Kenyan customers. */
export const WHATSAPP_DISPLAY = "0714 085 668";

export const INSTAGRAM_HANDLE = "26_kazoocraft.ke";

/**
 * Builds a wa.me deep link with a pre-filled message.
 *
 * The message is what the *customer* sends, so it's written in their voice —
 * it opens their WhatsApp with the text ready, and they tap send.
 */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Fallback greeting, used anywhere without more specific context. */
export const WHATSAPP_DEFAULT_MESSAGE =
  "Hi Kazoo Crafts! 👋 I found your website and I'd love to hear more about your handcrafted leather pieces.";
