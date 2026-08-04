import Link from "next/link";
import { updateStatus } from "@/lib/update-status";

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/provincias",
    description: "Listar provincias",
  },
  {
    method: "GET",
    path: "/api/v1/provincias/2/cantones",
    description:
      "Listar cantones de Alajuela",
  },
  {
    method: "GET",
    path: "/api/v1/cantones/202/distritos",
    description:
      "Listar distritos de San Ramón",
  },
  {
    method: "GET",
    path: "/api/v1/distritos/20205",
    description:
      "Consultar Piedades Sur",
  },
  {
    method: "GET",
    path: "/api/v1/buscar?q=san%20ramon",
    description:
      "Buscar por nombre o código",
  },
];

function formatDate(
  value: string | null
): string {
  if (!value) {
    return "No disponible";
  }

  return new Intl.DateTimeFormat(
    "es-CR",
    {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "America/Costa_Rica",
    }
  ).format(new Date(value));
}

export default function Home() {
  const catalogIsCurrent =
    !updateStatus.updateAvailable &&
    updateStatus.checkResult === "success";
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14">
          <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
            DTA 2026
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Geo CR API
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            API pública para consultar provincias,
            cantones y distritos de Costa Rica.
          </p>

          <p className="mt-3 max-w-3xl text-sm text-slate-400">
            Datos derivados de la División
            Territorial Administrativa del
            IGN/SNIT. Este proyecto no es un
            servicio oficial del Gobierno de
            Costa Rica.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/docs"
              className="rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-300"
            >
              Ver documentación
            </Link>

            <a
              href="/api/v1/openapi.json"
              className="rounded-lg border border-slate-600 px-5 py-3 font-semibold hover:bg-slate-900"
            >
              OpenAPI JSON
            </a>

            <a
              href="https://github.com/josuepj10/geo-cr-api"
              className="rounded-lg border border-slate-600 px-5 py-3 font-semibold hover:bg-slate-900"
            >
              GitHub
            </a>
          </div>
        </div>

                <section className="mb-12 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                Estado del catálogo
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                {catalogIsCurrent
                  ? "Catálogo actualizado"
                  : updateStatus.updateAvailable
                    ? "Actualización oficial detectada"
                    : "No fue posible comprobar la fuente"}
              </h2>
            </div>

            <span
              className={
                catalogIsCurrent
                  ? "rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300"
                  : updateStatus.updateAvailable
                    ? "rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-sm text-amber-300"
                    : "rounded-full border border-red-400/40 bg-red-400/10 px-3 py-1 text-sm text-red-300"
              }
            >
              {catalogIsCurrent
                ? "Actualizado"
                : updateStatus.updateAvailable
                  ? "Pendiente de revisión"
                  : "Comprobación fallida"}
            </span>
          </div>

          <p className="mt-4 text-sm text-slate-300">
            {updateStatus.message}
          </p>

          <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-slate-500">
                Versión publicada
              </dt>
              <dd className="mt-1 font-medium text-slate-200">
                {updateStatus.catalogVersion}
              </dd>
            </div>

            <div>
              <dt className="text-slate-500">
                Última versión detectada
              </dt>
              <dd className="mt-1 font-medium text-slate-200">
                {updateStatus.latestAvailableVersion ??
                  "No disponible"}
              </dd>
            </div>

            <div>
              <dt className="text-slate-500">
                Última comprobación
              </dt>
              <dd className="mt-1 font-medium text-slate-200">
                {formatDate(
                  updateStatus.lastCheckedAt
                )}
              </dd>
            </div>

            <div>
              <dt className="text-slate-500">
                Última actualización
              </dt>
              <dd className="mt-1 font-medium text-slate-200">
                {formatDate(
                  updateStatus.lastCatalogUpdateAt
                )}
              </dd>
            </div>
          </dl>

          <a
            href="/api/v1/actualizacion"
            className="mt-6 inline-flex text-sm font-medium text-emerald-300 hover:text-emerald-200"
          >
            Consultar estado en JSON →
          </a>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">
            Ejemplos
          </h2>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
            {endpoints.map((endpoint) => (
              <a
                key={endpoint.path}
                href={endpoint.path}
                className="grid gap-2 border-b border-slate-800 bg-slate-900/60 p-5 last:border-b-0 hover:bg-slate-900 md:grid-cols-[70px_1fr_1fr]"
              >
                <span className="font-mono text-sm font-bold text-emerald-300">
                  {endpoint.method}
                </span>

                <code className="break-all text-sm text-slate-200">
                  {endpoint.path}
                </code>

                <span className="text-sm text-slate-400">
                  {endpoint.description}
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold">
            Uso rápido
          </h2>

          <pre className="mt-4 overflow-x-auto rounded-lg bg-black p-4 text-sm text-emerald-300">
            <code>
              {`const response = await fetch(
  "https://geo-cr-api.vercel.app/api/v1/cantones/202/distritos"
);

const result = await response.json();
console.log(result.data);`}
            </code>
          </pre>
        </section>
      </div>
    </main>
  );
}
