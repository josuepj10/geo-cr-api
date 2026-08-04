import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";

type RawCell = string | number | boolean | null;
type RawRow = RawCell[];

type Provincia = {
  codigo: string;
  nombre: string;
  areaKm2: number;
};

type Canton = {
  codigo: string;
  nombre: string;
  provinciaCodigo: string;
  areaKm2: number;
};

type Distrito = {
  codigo: string;
  nombre: string;
  cantonCodigo: string;
  provinciaCodigo: string;
  areaKm2: number;
};

const rootDirectory = process.cwd();
const sourceFile = path.join(
  rootDirectory,
  "data",
  "source",
  "DTA-2026.xlsx"
);
const outputDirectory = path.join(
  rootDirectory,
  "data",
  "generated"
);

function fail(message: string): never {
  throw new Error(`[DTA] ${message}`);
}

function requireText(
  value: unknown,
  field: string
): string {
  if (typeof value !== "string") {
    fail(`El campo "${field}" no contiene texto.`);
  }

  const normalized = value.trim();

  if (!normalized) {
    fail(`El campo "${field}" está vacío.`);
  }

  return normalized;
}

function requireCode(
  value: unknown,
  length: number,
  field: string
): string {
  if (
    typeof value !== "string" &&
    typeof value !== "number"
  ) {
    fail(`El campo "${field}" no contiene un código válido.`);
  }

  const code = String(value).trim().padStart(length, "0");

  if (!new RegExp(`^\\d{${length}}$`).test(code)) {
    fail(`Código inválido en "${field}": ${String(value)}`);
  }

  return code;
}

function requireNumber(
  value: unknown,
  field: string
): number {
  const result = Number(value);

  if (!Number.isFinite(result)) {
    fail(`El campo "${field}" no contiene un número válido.`);
  }

  return result;
}

function getRows(
  workbook: XLSX.WorkBook,
  sheetName: string
): RawRow[] {
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    fail(`No existe la hoja "${sheetName}".`);
  }

  return XLSX.utils.sheet_to_json<RawRow>(sheet, {
    header: 1,
    defval: null,
    raw: true,
  });
}

function assertUniqueCodes(
  records: Array<{ codigo: string }>,
  entity: string
): void {
  const codes = new Set<string>();

  for (const record of records) {
    if (codes.has(record.codigo)) {
      fail(
        `Código duplicado de ${entity}: ${record.codigo}`
      );
    }

    codes.add(record.codigo);
  }
}

function writeJson(
  filename: string,
  value: unknown
): void {
  const destination = path.join(
    outputDirectory,
    filename
  );

  fs.writeFileSync(
    destination,
    `${JSON.stringify(value, null, 2)}\n`,
    "utf8"
  );
}

if (!fs.existsSync(sourceFile)) {
  fail(
    `No se encontró el archivo fuente: ${sourceFile}`
  );
}

const workbook = XLSX.readFile(sourceFile);

const provinceRows = getRows(
  workbook,
  "CUADRO_PROVINCIA"
);

const cantonRows = getRows(
  workbook,
  "CUADRO_CANTON"
);

const districtRows = getRows(
  workbook,
  "CUADRO_DISTRITO"
);


const provincias: Provincia[] = provinceRows
  .slice(7)
  .filter((row) => row[1] !== null)
  .map((row) => ({
    codigo: requireCode(
      row[1],
      1,
      "código de provincia"
    ),
    nombre: requireText(
      row[2],
      "nombre de provincia"
    ),
    areaKm2: requireNumber(
      row[3],
      "área de provincia"
    ),
  }));

const cantones: Canton[] = cantonRows
  .slice(7)
  .filter((row) => row[3] !== null)
  .map((row) => ({
    codigo: requireCode(
      row[3],
      3,
      "código de cantón"
    ),
    nombre: requireText(
      row[4],
      "nombre de cantón"
    ),
    provinciaCodigo: requireCode(
      row[1],
      1,
      "provincia del cantón"
    ),
    areaKm2: requireNumber(
      row[5],
      "área de cantón"
    ),
  }));

const distritos: Distrito[] = districtRows
  .slice(7)
  .filter((row) => row[5] !== null)
  .map((row) => ({
    codigo: requireCode(
      row[5],
      5,
      "código de distrito"
    ),
    nombre: requireText(
      row[6],
      "nombre de distrito"
    ),
    cantonCodigo: requireCode(
      row[3],
      3,
      "cantón del distrito"
    ),
    provinciaCodigo: requireCode(
      row[1],
      1,
      "provincia del distrito"
    ),
    areaKm2: requireNumber(
      row[7],
      "área de distrito"
    ),
  }));


if (provincias.length !== 7) {
  fail(
    `Se esperaban 7 provincias y se encontraron ${provincias.length}.`
  );
}

if (cantones.length !== 84) {
  fail(
    `Se esperaban 84 cantones y se encontraron ${cantones.length}.`
  );
}

if (distritos.length !== 494) {
  fail(
    `Se esperaban 494 distritos y se encontraron ${distritos.length}.`
  );
}

assertUniqueCodes(provincias, "provincia");
assertUniqueCodes(cantones, "cantón");
assertUniqueCodes(distritos, "distrito");

const provinceCodes = new Set(
  provincias.map((provincia) => provincia.codigo)
);

const cantonCodes = new Set(
  cantones.map((canton) => canton.codigo)
);

for (const canton of cantones) {
  if (!provinceCodes.has(canton.provinciaCodigo)) {
    fail(
      `El cantón ${canton.codigo} referencia una provincia inexistente.`
    );
  }

  if (!canton.codigo.startsWith(canton.provinciaCodigo)) {
    fail(
      `El código del cantón ${canton.codigo} no coincide con su provincia.`
    );
  }
}

for (const distrito of distritos) {
  if (!provinceCodes.has(distrito.provinciaCodigo)) {
    fail(
      `El distrito ${distrito.codigo} referencia una provincia inexistente.`
    );
  }

  if (!cantonCodes.has(distrito.cantonCodigo)) {
    fail(
      `El distrito ${distrito.codigo} referencia un cantón inexistente.`
    );
  }

  if (!distrito.codigo.startsWith(distrito.cantonCodigo)) {
    fail(
      `El código del distrito ${distrito.codigo} no coincide con su cantón.`
    );
  }
}

fs.mkdirSync(outputDirectory, {
  recursive: true,
});

writeJson("provincias.json", provincias);
writeJson("cantones.json", cantones);
writeJson("distritos.json", distritos);

writeJson("metadata.json", {
  catalogVersion: "DTA-2026",
  apiVersion: "v1",
  source: {
    institution:
      "Instituto Geográfico Nacional / Sistema Nacional de Información Territorial",
    dataset:
      "División Territorial Administrativa 2026",
    originalFile: "DTA-2026.xlsx",
  },
  counts: {
    provincias: provincias.length,
    cantones: cantones.length,
    distritos: distritos.length,
  },
});

console.log("Catálogo DTA importado correctamente:");
console.log(`- Provincias: ${provincias.length}`);
console.log(`- Cantones:   ${cantones.length}`);
console.log(`- Distritos:  ${distritos.length}`);
console.log(`- Destino:    ${outputDirectory}`);
