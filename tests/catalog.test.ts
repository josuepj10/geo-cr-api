import { describe, expect, it } from "vitest";

import {
  catalogMetadata,
  getCanton,
  getCantones,
  getCantonesByProvincia,
  getDistrito,
  getDistritos,
  getDistritosByCanton,
  getProvincia,
  getProvincias,
  searchCatalog,
} from "../src/lib/catalog";

describe("integridad del catálogo DTA 2026", () => {
  it("contiene los conteos oficiales esperados", () => {
    expect(catalogMetadata.catalogVersion).toBe(
      "DTA-2026"
    );

    expect(catalogMetadata.counts).toEqual({
      provincias: 7,
      cantones: 84,
      distritos: 494,
    });

    expect(getProvincias()).toHaveLength(7);
    expect(getCantones()).toHaveLength(84);
    expect(getDistritos()).toHaveLength(494);
  });

  it("no contiene códigos duplicados", () => {
    const provinciaCodes = getProvincias().map(
      (item) => item.codigo
    );

    const cantonCodes = getCantones().map(
      (item) => item.codigo
    );

    const distritoCodes = getDistritos().map(
      (item) => item.codigo
    );

    expect(new Set(provinciaCodes).size).toBe(
      provinciaCodes.length
    );

    expect(new Set(cantonCodes).size).toBe(
      cantonCodes.length
    );

    expect(new Set(distritoCodes).size).toBe(
      distritoCodes.length
    );
  });

  it("todos los cantones pertenecen a una provincia válida", () => {
    const provinceCodes = new Set(
      getProvincias().map((item) => item.codigo)
    );

    for (const canton of getCantones()) {
      expect(
        provinceCodes.has(canton.provinciaCodigo)
      ).toBe(true);

      expect(
        canton.codigo.startsWith(
          canton.provinciaCodigo
        )
      ).toBe(true);
    }
  });

  it("todos los distritos pertenecen a un cantón y provincia válidos", () => {
    const provinceCodes = new Set(
      getProvincias().map((item) => item.codigo)
    );

    const cantonCodes = new Set(
      getCantones().map((item) => item.codigo)
    );

    for (const distrito of getDistritos()) {
      expect(
        provinceCodes.has(
          distrito.provinciaCodigo
        )
      ).toBe(true);

      expect(
        cantonCodes.has(distrito.cantonCodigo)
      ).toBe(true);

      expect(
        distrito.codigo.startsWith(
          distrito.cantonCodigo
        )
      ).toBe(true);
    }
  });
});

describe("consultas territoriales", () => {
  it("encuentra Alajuela, San Ramón y Piedades Sur", () => {
    expect(getProvincia("2")?.nombre).toBe(
      "Alajuela"
    );

    expect(getCanton("202")?.nombre).toBe(
      "San Ramón"
    );

    expect(getDistrito("20205")?.nombre).toBe(
      "Piedades Sur"
    );
  });

  it("devuelve los 16 cantones de Alajuela", () => {
    const cantones =
      getCantonesByProvincia("2");

    expect(cantones).toHaveLength(16);

    expect(
      cantones.some(
        (item) => item.codigo === "202"
      )
    ).toBe(true);
  });

  it("devuelve los 14 distritos de San Ramón", () => {
    const distritos =
      getDistritosByCanton("202");

    expect(distritos).toHaveLength(14);

    expect(
      distritos.some(
        (item) => item.codigo === "20205"
      )
    ).toBe(true);
  });

  it("devuelve undefined para códigos inexistentes", () => {
    expect(getProvincia("9")).toBeUndefined();
    expect(getCanton("999")).toBeUndefined();
    expect(getDistrito("99999")).toBeUndefined();
  });
});

describe("búsqueda territorial", () => {
  it("ignora mayúsculas, minúsculas y tildes", () => {
    const results = searchCatalog(
      "san ramon"
    );

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tipo: "canton",
          codigo: "202",
          nombre: "San Ramón",
        }),
      ])
    );
  });

  it("prioriza una coincidencia exacta de código", () => {
    const results = searchCatalog("20205");

    expect(results[0]).toMatchObject({
      tipo: "distrito",
      codigo: "20205",
      nombre: "Piedades Sur",
    });
  });

  it("respeta el límite solicitado", () => {
    const results = searchCatalog("san", 2);

    expect(results).toHaveLength(2);
  });

  it("devuelve un arreglo vacío para una búsqueda vacía", () => {
    expect(searchCatalog("   ")).toEqual([]);
  });
});
