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

type ImportOptions = {
  source: string;
  output: string;
  version: string;
  allowCountChange: boolean;
};

const CURRENT_COUNTS = {
  provincias: 7,
  cantones: 84,
  distritos: 494,
};

const rootDirectory = process.cwd();

function fail(message: string): never {
  throw new Error(`[DTA] ${message}`);
}

function getRequiredArgument(
  args: string[],
  index: number,
  option: string
): string {
  const value = args[index + 1];

  if (!value || value.startsWith("--")) {
    fail(`Debe indicar un valor para ${option}.`);
  }

  return value;
}

function parseArguments(args: string[]): ImportOptions {
  const options: ImportOptions = {
    source: "data/source/DTA-2026.xlsx",
    output: "data/generated",
    version: "DTA-2026",
    allowCountChange: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    switch (argument) {
      case "--source":
        options.source = getRequiredArgument(
          args,
          index,
          argument
        );
        index += 1;
        break;

      case "--output":
        options.output = getRequiredArgument(
          args,
          index,
          argument
        );
        index += 1;
        break;

      case "--version":
        options.version = getRequiredArgument(
          args,
          index,
          argument
        );
        index += 1;
        break;

      case "--allow-count-change":
        options.allowCountChange = true;
        break;

      default:
        fail(`Argumento desconocido: ${argument}`);
    }
  }

  if (!/^DTA-20\d{2}$/.test(options.version)) {
    fail(
      `La versión debe tener el formato DTA-AAAA: ${options.version}`
    );
  }

  return options;
}

function resolveFromRoot(filename: string): string {
  return path.isAbsolute(filename)
    ? filename
    : path.resolve(rootDirectory, filename);
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

  const code = String(value)
    .trim()
    .padStart(length, "0");

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

  if (!Number.isFinite(result) || result < 0) {
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
    fail(
      `No existe la hoja "${sheetName}". Hojas encontradas: ${workbook.SheetNames.join(", ")}`
    );
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
      fail(`Código duplicado de ${entity}: ${record.codigo}`);
    }

    codes.add(record.codigo);
  }
}

function sortByCode<T extends { codigo: string }>(
  records: T[]
): T[] {
  return [...records].sort((a, b) =>
    a.codigo.localeCompare(b.codigo, "es-CR")
  );
}

function writeJson(
  outputDirectory: string,
  filename: string,
  value: unknown
): void {
  fs.writeFileSync(
    path.join(outputDirectory, filename),
    `${JSON.stringify(value, null, 2)}\n`,
    "utf8"
  );
}

const options = parseArguments(process.argv.slice(2));
const sourceFile = resolveFromRoot(options.source);
const outputDirectory = resolveFromRoot(options.output);

if (!fs.existsSync(sourceFile)) {
  fail(`No se encontró el archivo fuente: ${sourceFile}`);
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

const provincias = sortByCode<Provincia>(
  provinceRows
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
    }))
);

const cantones = sortByCode<Canton>(
  cantonRows
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
    }))
);

const distritos = sortByCode<Distrito>(
  districtRows
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
    }))
);

if (provincias.length === 0) {
  fail("No se importaron provincias.");
}

if (cantones.length === 0) {
  fail("No se importaron cantones.");
}

if (distritos.length === 0) {
  fail("No se importaron distritos.");
}

if (!options.allowCountChange) {
  if (provincias.length !== CURRENT_COUNTS.provincias) {
    fail(
      `Se esperaban ${CURRENT_COUNTS.provincias} provincias y se encontraron ${provincias.length}.`
    );
  }

  if (cantones.length !== CURRENT_COUNTS.cantones) {
    fail(
      `Se esperaban ${CURRENT_COUNTS.cantones} cantones y se encontraron ${cantones.length}.`
    );
  }

  if (distritos.length !== CURRENT_COUNTS.distritos) {
    fail(
      `Se esperaban ${CURRENT_COUNTS.distritos} distritos y se encontraron ${distritos.length}.`
    );
  }
}

assertUniqueCodes(provincias, "provincia");
assertUniqueCodes(cantones, "cantón");
assertUniqueCodes(distritos, "distrito");

const provinceCodes = new Set(
  provincias.map((item) => item.codigo)
);

const cantonCodes = new Set(
  cantones.map((item) => item.codigo)
);

const cantonByCode = new Map(
  cantones.map((item) => [item.codigo, item])
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

  const canton = cantonByCode.get(
    distrito.cantonCodigo
  );

  if (
    canton?.provinciaCodigo !==
    distrito.provinciaCodigo
  ) {
    fail(
      `El distrito ${distrito.codigo} no coincide con la provincia de su cantón.`
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

writeJson(
  outputDirectory,
  "provincias.json",
  provincias
);

writeJson(
  outputDirectory,
  "cantones.json",
  cantones
);

writeJson(
  outputDirectory,
  "distritos.json",
  distritos
);

writeJson(
  outputDirectory,
  "metadata.json",
  {
    catalogVersion: options.version,
    apiVersion: "v1",
    source: {
      institution:
        "Instituto Geográfico Nacional / Sistema Nacional de Información Territorial",
      dataset:
        `División Territorial Administrativa ${options.version.replace("DTA-", "")}`,
      originalFile: path.basename(sourceFile),
    },
    counts: {
      provincias: provincias.length,
      cantones: cantones.length,
      distritos: distritos.length,
    },
  }
);

console.log("");
console.log("Catálogo DTA importado correctamente:");
console.log(`- Fuente:     ${sourceFile}`);
console.log(`- Versión:    ${options.version}`);
console.log(`- Provincias: ${provincias.length}`);
console.log(`- Cantones:   ${cantones.length}`);
console.log(`- Distritos:  ${distritos.length}`);
console.log(`- Destino:    ${outputDirectory}`);
console.log(
  `- Cambio de conteos permitido: ${options.allowCountChange ? "sí" : "no"}`
);
