import type { Metadata } from "next";
import Link from "next/link";

import { SwaggerClient } from "./swagger-client";

export const metadata: Metadata = {
  title: "Documentación | Geo CR API",
  description:
    "Documentación interactiva de Geo CR API.",
};

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-slate-950 px-6 py-5 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              Geo CR API
            </h1>
            <p className="text-sm text-slate-300">
              Documentación OpenAPI
            </p>
          </div>

          <Link
            href="/"
            className="rounded-md border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Inicio
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Este es un proyecto independiente y no
          constituye un servicio oficial del
          Gobierno de Costa Rica.
        </div>

        <SwaggerClient />
      </div>
    </main>
  );
}
