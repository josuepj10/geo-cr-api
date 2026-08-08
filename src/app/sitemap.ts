import type { MetadataRoute } from "next";

const baseUrl = "https://geo-cr-api.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/docs`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}
