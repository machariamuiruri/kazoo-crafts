import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/*
 * Content-Security-Policy.
 *
 * Two deliberate weaknesses, both documented rather than hidden:
 *
 * 1. `'unsafe-inline'` in script-src. Next injects inline bootstrap scripts,
 *    and locking those down properly needs per-request nonces generated in
 *    middleware. That's the right follow-up; until then this CSP limits where
 *    scripts can be *loaded from* but won't stop an injected inline script.
 * 2. `'unsafe-eval'` in development only — the dev overlay and Fast Refresh
 *    need it. It is not emitted in production builds.
 *
 * Fonts are self-hosted (see layout.tsx), so no third-party origins are
 * allowed here at all — style-src and font-src are both 'self'.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob:",
  // Dev needs the websocket for Fast Refresh.
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  // Don't advertise the framework version to attackers scanning for it.
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            // Only meaningful over HTTPS; Vercel terminates TLS so this is live
            // in production and ignored on localhost.
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
