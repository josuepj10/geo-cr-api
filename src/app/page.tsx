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

          <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
            API de provincias, cantones y distritos de Costa Rica
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Consulte gratuitamente la División Territorial
            Administrativa de Costa Rica mediante una API REST
            pública con respuestas JSON, códigos territoriales,
            búsqueda y documentación OpenAPI.
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
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">
          API territorial de Costa Rica
        </h2>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-lg font-semibold">
              Provincias, cantones y distritos
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Geo CR API permite consultar la organización
              territorial de Costa Rica utilizando los códigos
              oficiales de provincia, cantón y distrito.
            </p>
          </article>

          <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-lg font-semibold">
              Integración mediante JSON
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Puede utilizar la API desde aplicaciones web,
              tiendas en línea, sistemas empresariales,
              formularios, plataformas educativas y servicios
              de logística.
            </p>
          </article>

          <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-lg font-semibold">
              División Territorial Administrativa
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              El catálogo se deriva de información publicada
              por el Instituto Geográfico Nacional y el Sistema
              Nacional de Información Territorial de Costa Rica.
            </p>
          </article>

          <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-lg font-semibold">
              Gratuita y de código abierto
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              La API puede consultarse públicamente sin crear
              una cuenta y su código fuente está disponible
              para revisión y contribuciones en GitHub.
            </p>
          </article>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">
          Preguntas frecuentes
        </h2>

        <div className="mt-6 space-y-4">
          <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="font-semibold">
              ¿Cómo obtener las provincias de Costa Rica?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Consulte el endpoint
              <code className="mx-1 text-emerald-300">
                /api/v1/provincias
              </code>
              para obtener las provincias disponibles en formato JSON.
            </p>
          </article>

          <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="font-semibold">
              ¿Cómo obtener los cantones de una provincia?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Utilice
              <code className="mx-1 text-emerald-300">
                /api/v1/provincias/&#123;codigo&#125;/cantones
              </code>
              indicando el código de la provincia.
            </p>
          </article>

          <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="font-semibold">
              ¿Cómo obtener los distritos de un cantón?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Consulte
              <code className="mx-1 text-emerald-300">
                /api/v1/cantones/&#123;codigo&#125;/distritos
              </code>
              para obtener los distritos asociados.
            </p>
          </article>

          <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="font-semibold">
              ¿Geo CR API es una API oficial del Gobierno?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              No. Geo CR API es un proyecto independiente que
              procesa información derivada de fuentes del
              IGN/SNIT para facilitar su consumo mediante una API.
            </p>
          </article>
        </div>
      </section>

    </main>
  );
}
