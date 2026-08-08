import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = "https://geo-cr-api.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),

  title: {
    default:
      "Geo CR API | Provincias, cantones y distritos de Costa Rica",
    template: "%s | Geo CR API",
  },

  description:
    "API pública y gratuita para consultar provincias, cantones y distritos de Costa Rica. Datos derivados de la División Territorial Administrativa del IGN/SNIT.",

  applicationName: "Geo CR API",

  keywords: [
    "API Costa Rica",
    "API provincias Costa Rica",
    "API cantones Costa Rica",
    "API distritos Costa Rica",
    "provincias cantones distritos Costa Rica",
    "División Territorial Administrativa Costa Rica",
    "DTA Costa Rica",
    "códigos territoriales Costa Rica",
    "datos geográficos Costa Rica",
    "API direcciones Costa Rica",
    "Costa Rica JSON",
    "IGN Costa Rica",
    "SNIT Costa Rica",
  ],

  creator: "Geo CR API",
  publisher: "Geo CR API",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "es_CR",
    url: "/",
    siteName: "Geo CR API",
    title:
      "Geo CR API | Provincias, cantones y distritos de Costa Rica",
    description:
      "API pública y gratuita para consultar la división territorial de Costa Rica mediante JSON.",
  },

  twitter: {
    card: "summary_large_image",
    title:
      "Geo CR API | Provincias, cantones y distritos de Costa Rica",
    description:
      "API pública y gratuita para consultar provincias, cantones y distritos de Costa Rica.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  category: "technology",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="es-CR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
