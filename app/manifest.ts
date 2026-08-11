import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tonight's Menu",
    short_name: "Tonight's Menu",
    description: "A shared decision-making tool for what to eat tonight.",
    start_url: "/",
    display: "standalone",
    background_color: "#cdeafb",
    theme_color: "#e4000f",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
