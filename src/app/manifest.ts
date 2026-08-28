import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kazoo Crafts",
    short_name: "Kazoo",
    description: "Handcrafted leather goods, made in Kenya.",
    start_url: "/",
    display: "standalone",
    background_color: "#F9F6F0",
    theme_color: "#6B3A19",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      // Maskable copy so Android doesn't letterbox the icon inside its own
      // shape. The mark is a rounded square already, so it crops acceptably.
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
