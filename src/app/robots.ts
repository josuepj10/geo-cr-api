import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://geo-cr-api.vercel.app/sitemap.xml",
    host: "https://geo-cr-api.vercel.app",
  };
}
