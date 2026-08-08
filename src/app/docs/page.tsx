import type { Metadata } from "next";
import Link from "next/link";

import { SwaggerClient } from "./swagger-client";

export const metadata: Metadata = {
  title:
    "Documentación API de provincias, cantones y distritos de Costa Rica",

  description:
    "Documentación de Geo CR API, una API REST pública y gratuita para consultar provincias, cantones y distritos de Costa Rica mediante JSON y OpenAPI.",

  alternates: {
    canonical: "/docs",
  },

  openGraph: {
    type: "website",
    url: "/docs",
    title:
      "Documentación de Geo CR API",
    description:
      "Endpoints y documentación OpenAPI para consultar provincias, cantones y distritos de Costa Rica.",
  },

  twitter: {
    card: "summary_large_image",
    title:
      "Documentación de Geo CR API",
    description:
      "API REST pública para consultar la división territorial de Costa Rica.",
  },
};

const endpoints = [
  {
    path: "/api/v1/provincias",
    description:
      "Obtiene la lista de provincias de Costa Rica.",
  },
  {
    path: "/api/v1/provincias/{codigo}/cantones",
    description:
      "Obtiene los cantones asociados a una provincia.",
  },
  {
    path: "/api/v1/cantones/{codigo}/distritos",
    description:
      "Obtiene los distritos asociados a un cantón.",
  },
  {
    path: "/api/v1/distritos/{codigo}",
    description:
      "Consulta directamente un distrito por su código territorial.",
  },
  {
    path: "/api/v1/buscar?q=",
    description:
      "Busca provincias, cantones y distritos por nombre o código.",
  },
];

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-5">
          <div>
            <Link
              href="/"
              className="text-lg font-bold text-white"
            >
              Geo CR API
            </Link>

            <p className="mt-1 text-sm text-slate-400">
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

      <div className="mx-auto max-w-7xl px-4 py-10">
        <section className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
            Geo CR API
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Documentación de la API territorial de Costa Rica
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-300">
            Consulte provincias, cantones y distritos de
            Costa Rica mediante una API REST pública con
            respuestas JSON, búsqueda territorial y
            documentación OpenAPI.
          </p>

          <p className="mt-4 leading-7 text-slate-400">
            Geo CR API facilita la integración de la
            División Territorial Administrativa de Costa Rica
            en aplicaciones web, formularios, tiendas en línea,
            sistemas empresariales, plataformas educativas y
            soluciones de logística.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/api/v1/openapi.json"
              className="rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-300"
            >
              Ver OpenAPI JSON
            </a>

            <a
              href="https://github.com/josuepj10/geo-cr-api"
              className="rounded-lg border border-slate-600 px-5 py-3 font-semibold hover:bg-slate-900"
            >
              Código en GitHub
            </a>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">
            Principales endpoints
          </h2>

          <p className="mt-3 max-w-3xl text-slate-400">
            Estos son algunos de los recursos disponibles.
            La especificación interactiva completa se encuentra
            más abajo.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {endpoints.map((endpoint) => (
              <article
                key={endpoint.path}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="rounded bg-emerald-400/10 px-2 py-1 font-mono text-xs font-bold text-emerald-300">
                    GET
                  </span>

                  <code className="break-all text-sm text-slate-200">
                    {endpoint.path}
                  </code>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {endpoint.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold">
            Formato de respuesta
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Los endpoints públicos utilizan JSON. Puede
            consumirlos desde JavaScript, TypeScript, PHP,
            Python, aplicaciones móviles u otros clientes HTTP.
          </p>

          <pre className="mt-5 overflow-x-auto rounded-lg bg-black p-4 text-sm text-emerald-300">
            <code>
              {`const response = await fetch(
  "https://geo-cr-api.vercel.app/api/v1/provincias"
);

const result = await response.json();

console.log(result.data);`}
            </code>
          </pre>
        </section>

        <div className="mt-12 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Geo CR API es un proyecto independiente y no
          constituye un servicio oficial del Gobierno de
          Costa Rica, del Instituto Geográfico Nacional ni
          del Sistema Nacional de Información Territorial.
        </div>

        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-semibold">
            Referencia OpenAPI interactiva
          </h2>

          <div className="overflow-hidden rounded-xl bg-white">
            <SwaggerClient />
          </div>
        </section>
      </div>
    </main>
  );
}
