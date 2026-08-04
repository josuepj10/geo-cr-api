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

const provincias = provinciasJson as Provincia[];
const cantones = cantonesJson as Canton[];
const distritos = distritosJson as Distrito[];

export const catalogMetadata =
  metadataJson as CatalogMetadata;

export const cacheHeaders = {
  "Cache-Control":
    "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
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
