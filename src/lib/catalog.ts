import provinciasJson from "../../data/generated/provincias.json";
import cantonesJson from "../../data/generated/cantones.json";
import distritosJson from "../../data/generated/distritos.json";
import metadataJson from "../../data/generated/metadata.json";

export type Provincia = {
  codigo: string;
  nombre: string;
  areaKm2: number;
};

export type Canton = {
  codigo: string;
  nombre: string;
  provinciaCodigo: string;
  areaKm2: number;
};

export type Distrito = {
  codigo: string;
  nombre: string;
  cantonCodigo: string;
  provinciaCodigo: string;
  areaKm2: number;
};

export type CatalogMetadata = {
  catalogVersion: string;
  apiVersion: string;
  source: {
    institution: string;
    dataset: string;
    originalFile: string;
  };
  counts: {
    provincias: number;
    cantones: number;
    distritos: number;
  };
};

export type SearchResult = {
  tipo: "provincia" | "canton" | "distrito";
  codigo: string;
  nombre: string;
  areaKm2: number;
  provinciaCodigo?: string;
  cantonCodigo?: string;
};

const provincias = provinciasJson as Provincia[];
const cantones = cantonesJson as Canton[];
const distritos = distritosJson as Distrito[];

export const catalogMetadata =
  metadataJson as CatalogMetadata;

export const cacheHeaders = {
  "Cache-Control":
    "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

export function getProvincias(): Provincia[] {
  return provincias;
}

export function getProvincia(
  codigo: string
): Provincia | undefined {
  return provincias.find(
    (provincia) => provincia.codigo === codigo
  );
}

export function getCantones(): Canton[] {
  return cantones;
}

export function getCantonesByProvincia(
  provinciaCodigo: string
): Canton[] {
  return cantones.filter(
    (canton) =>
      canton.provinciaCodigo === provinciaCodigo
  );
}

export function getCanton(
  codigo: string
): Canton | undefined {
  return cantones.find(
    (canton) => canton.codigo === codigo
  );
}

export function getDistritos(): Distrito[] {
  return distritos;
}

export function getDistritosByCanton(
  cantonCodigo: string
): Distrito[] {
  return distritos.filter(
    (distrito) =>
      distrito.cantonCodigo === cantonCodigo
  );
}

export function getDistrito(
  codigo: string
): Distrito | undefined {
  return distritos.find(
    (distrito) => distrito.codigo === codigo
  );
}

export function getCatalog() {
  return {
    provincias,
    cantones,
    distritos,
  };
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es-CR")
    .trim();
}

export function searchCatalog(
  query: string,
  limit = 25
): SearchResult[] {
  const originalQuery = query.trim();
  const normalizedQuery =
    normalizeSearchText(originalQuery);

  if (!normalizedQuery) {
    return [];
  }

  const results: SearchResult[] = [
    ...provincias.map((provincia) => ({
      tipo: "provincia" as const,
      codigo: provincia.codigo,
      nombre: provincia.nombre,
      areaKm2: provincia.areaKm2,
    })),
    ...cantones.map((canton) => ({
      tipo: "canton" as const,
      codigo: canton.codigo,
      nombre: canton.nombre,
      provinciaCodigo:
        canton.provinciaCodigo,
      areaKm2: canton.areaKm2,
    })),
    ...distritos.map((distrito) => ({
      tipo: "distrito" as const,
      codigo: distrito.codigo,
      nombre: distrito.nombre,
      provinciaCodigo:
        distrito.provinciaCodigo,
      cantonCodigo: distrito.cantonCodigo,
      areaKm2: distrito.areaKm2,
    })),
  ];

  function getScore(result: SearchResult): number {
    const normalizedName =
      normalizeSearchText(result.nombre);

    if (result.codigo === originalQuery) {
      return 0;
    }

    if (normalizedName === normalizedQuery) {
      return 1;
    }

    if (normalizedName.startsWith(normalizedQuery)) {
      return 2;
    }

    return 3;
  }

  return results
    .filter((result) => {
      const normalizedName =
        normalizeSearchText(result.nombre);

      return (
        result.codigo.includes(originalQuery) ||
        normalizedName.includes(normalizedQuery)
      );
    })
    .sort((a, b) => {
      const scoreDifference =
        getScore(a) - getScore(b);

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return a.nombre.localeCompare(
        b.nombre,
        "es-CR"
      );
    })
    .slice(0, limit);
}
