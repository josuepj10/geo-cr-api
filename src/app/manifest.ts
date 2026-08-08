import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Geo CR API",
    short_name: "Geo CR API",
    description:
      "API pública y gratuita para consultar provincias, cantones y distritos de Costa Rica.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#020617",
    lang: "es-CR",
  };
}
