import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

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

type CatalogMetadata = {
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

type UpdateStatus = {
  status:
    | "up-to-date"
    | "update-available"
    | "check-failed";
  catalogVersion: string;
  latestAvailableVersion: string | null;
  publishedSourceUrl: string | null;
  publishedSourceSha256: string | null;
  latestSourceUrl: string | null;
  latestSourceSha256: string | null;
  lastCheckedAt: string;
  lastCatalogUpdateAt: string | null;
  sourceChangedAt: string | null;
  updateAvailable: boolean;
  checkResult: "success" | "error";
  message: string;
};

type BasicRecord = {
  codigo: string;
  nombre: string;
  areaKm2: number;
};

type ChangedRecord = {
  codigo: string;
  changes: string[];
};

type ComparisonResult = {
  added: BasicRecord[];
  removed: BasicRecord[];
  changed: ChangedRecord[];
};

const rootDirectory = process.cwd();

const generatedDirectory = path.join(
  rootDirectory,
  "data",
  "generated"
);

const candidateDirectory = path.join(
  rootDirectory,
  "data",
  "update-candidate"
);

const sourceDirectory = path.join(
  rootDirectory,
  "data",
  "source"
);

const statusPath = path.join(
  generatedDirectory,
  "update-status.json"
);

const reportPath = path.join(
  generatedDirectory,
  "UPDATE_REPORT.md"
);

const force = process.argv.includes("--force");

function fail(message: string): never {
  throw new Error(`[DTA] ${message}`);
}

function readJson<T>(filename: string): T {
  return JSON.parse(
    fs.readFileSync(filename, "utf8")
  ) as T;
}

function writeJson(
  filename: string,
  value: unknown
): void {
  fs.writeFileSync(
    filename,
    `${JSON.stringify(value, null, 2)}\n`,
    "utf8"
  );
}

function getSourceFilename(
  sourceUrl: string,
  version: string
): string {
  try {
    const url = new URL(sourceUrl);
    const filename = decodeURIComponent(
      path.basename(url.pathname)
    );

    return filename || `${version}.xlsx`;
  } catch {
    return `${version}.xlsx`;
  }
}

function isXlsx(content: Buffer): boolean {
  return (
    content.length > 4 &&
    content[0] === 0x50 &&
    content[1] === 0x4b
  );
}

async function downloadFile(
  url: string,
  destination: string
): Promise<void> {
  console.log(`[DTA] Descargando ${url}`);

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "geo-cr-api-update-preparer/0.1",
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream",
    },
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    fail(
      `No se pudo descargar la fuente: HTTP ${response.status}`
    );
  }

  const content = Buffer.from(
    await response.arrayBuffer()
  );

  if (!isXlsx(content)) {
    fail(
      "La fuente descargada no parece ser un archivo XLSX válido."
    );
  }

  fs.writeFileSync(destination, content);
}

function runImporter(
  sourcePath: string,
  version: string
): void {
  const importerPath = path.join(
    rootDirectory,
    "scripts",
    "import-dta.ts"
  );

  const result = spawnSync(
    process.execPath,
    [
      "--import",
      "tsx",
      importerPath,
      "--source",
      sourcePath,
      "--version",
      version,
      "--output",
      candidateDirectory,
      "--allow-count-change",
    ],
    {
      cwd: rootDirectory,
      stdio: "inherit",
      windowsHide: true,
    }
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    fail(
      `El importador terminó con código ${String(result.status)}.`
    );
  }
}

function compareRecords<
  T extends BasicRecord
>(
  currentRecords: T[],
  candidateRecords: T[],
  relationshipFields: Array<keyof T>
): ComparisonResult {
  const currentByCode = new Map(
    currentRecords.map((record) => [
      record.codigo,
      record,
    ])
  );

  const candidateByCode = new Map(
    candidateRecords.map((record) => [
      record.codigo,
      record,
    ])
  );

  const added: BasicRecord[] = [];
  const removed: BasicRecord[] = [];
  const changed: ChangedRecord[] = [];

  for (const candidate of candidateRecords) {
    const current =
      currentByCode.get(candidate.codigo);

    if (!current) {
      added.push({
        codigo: candidate.codigo,
        nombre: candidate.nombre,
        areaKm2: candidate.areaKm2,
      });

      continue;
    }

    const changes: string[] = [];

    if (current.nombre !== candidate.nombre) {
      changes.push(
        `nombre: "${current.nombre}" → "${candidate.nombre}"`
      );
    }

    if (
      Math.abs(
        current.areaKm2 - candidate.areaKm2
      ) > 0.000001
    ) {
      changes.push(
        `área: ${current.areaKm2} → ${candidate.areaKm2} km²`
      );
    }

    for (const field of relationshipFields) {
      if (current[field] !== candidate[field]) {
        changes.push(
          `${String(field)}: ${String(current[field])} → ${String(candidate[field])}`
        );
      }
    }

    if (changes.length > 0) {
      changed.push({
        codigo: candidate.codigo,
        changes,
      });
    }
  }

  for (const current of currentRecords) {
    if (!candidateByCode.has(current.codigo)) {
      removed.push({
        codigo: current.codigo,
        nombre: current.nombre,
        areaKm2: current.areaKm2,
      });
    }
  }

  return {
    added,
    removed,
    changed,
  };
}

function hasDifferences(
  comparison: ComparisonResult
): boolean {
  return (
    comparison.added.length > 0 ||
    comparison.removed.length > 0 ||
    comparison.changed.length > 0
  );
}

function renderRecordList(
  records: BasicRecord[]
): string {
  if (records.length === 0) {
    return "_Ninguno._";
  }

  return records
    .map(
      (record) =>
        `- \`${record.codigo}\` — ${record.nombre}`
    )
    .join("\n");
}

function renderChangedList(
  records: ChangedRecord[]
): string {
  if (records.length === 0) {
    return "_Ninguno._";
  }

  return records
    .map(
      (record) =>
        `- \`${record.codigo}\`: ${record.changes.join("; ")}`
    )
    .join("\n");
}

function createReport(
  currentMetadata: CatalogMetadata,
  candidateMetadata: CatalogMetadata,
  provinceComparison: ComparisonResult,
  cantonComparison: ComparisonResult,
  districtComparison: ComparisonResult,
  status: UpdateStatus
): string {
  return `# Reporte automático de actualización DTA

Generado: ${new Date().toISOString()}

## Fuente

- Versión publicada: \`${currentMetadata.catalogVersion}\`
- Versión candidata: \`${candidateMetadata.catalogVersion}\`
- URL oficial: ${status.latestSourceUrl ?? "No disponible"}
- SHA-256 publicado: \`${status.publishedSourceSha256 ?? "No disponible"}\`
- SHA-256 candidato: \`${status.latestSourceSha256 ?? "No disponible"}\`

## Conteos

| Entidad | Publicado | Candidato | Diferencia |
|---|---:|---:|---:|
| Provincias | ${currentMetadata.counts.provincias} | ${candidateMetadata.counts.provincias} | ${candidateMetadata.counts.provincias - currentMetadata.counts.provincias} |
| Cantones | ${currentMetadata.counts.cantones} | ${candidateMetadata.counts.cantones} | ${candidateMetadata.counts.cantones - currentMetadata.counts.cantones} |
| Distritos | ${currentMetadata.counts.distritos} | ${candidateMetadata.counts.distritos} | ${candidateMetadata.counts.distritos - currentMetadata.counts.distritos} |

## Provincias agregadas

${renderRecordList(provinceComparison.added)}

## Provincias eliminadas

${renderRecordList(provinceComparison.removed)}

## Provincias modificadas

${renderChangedList(provinceComparison.changed)}

## Cantones agregados

${renderRecordList(cantonComparison.added)}

## Cantones eliminados

${renderRecordList(cantonComparison.removed)}

## Cantones modificados

${renderChangedList(cantonComparison.changed)}

## Distritos agregados

${renderRecordList(districtComparison.added)}

## Distritos eliminados

${renderRecordList(districtComparison.removed)}

## Distritos modificados

${renderChangedList(districtComparison.changed)}

## Revisión requerida

Este reporte fue generado automáticamente. La actualización debe revisarse antes de fusionarse con la rama principal.
`;
}

async function main(): Promise<void> {
  if (!fs.existsSync(statusPath)) {
    fail(
      "No existe data/generated/update-status.json."
    );
  }

  const status =
    readJson<UpdateStatus>(statusPath);

  if (!status.updateAvailable && !force) {
    console.log(
      "[DTA] No hay una actualización pendiente."
    );

    return;
  }

  const version =
    status.latestAvailableVersion;

  const sourceUrl =
    status.latestSourceUrl;

  if (!version || !sourceUrl) {
    fail(
      "El estado no contiene versión o URL candidata."
    );
  }

  fs.mkdirSync(sourceDirectory, {
    recursive: true,
  });

  fs.rmSync(candidateDirectory, {
    recursive: true,
    force: true,
  });

  fs.mkdirSync(candidateDirectory, {
    recursive: true,
  });

  const sourceFilename =
    getSourceFilename(sourceUrl, version);

  const sourcePath = path.join(
    sourceDirectory,
    sourceFilename
  );

  await downloadFile(
    sourceUrl,
    sourcePath
  );

  runImporter(sourcePath, version);

  const currentMetadata =
    readJson<CatalogMetadata>(
      path.join(
        generatedDirectory,
        "metadata.json"
      )
    );

  const candidateMetadata =
    readJson<CatalogMetadata>(
      path.join(
        candidateDirectory,
        "metadata.json"
      )
    );

  const currentProvincias =
    readJson<Provincia[]>(
      path.join(
        generatedDirectory,
        "provincias.json"
      )
    );

  const candidateProvincias =
    readJson<Provincia[]>(
      path.join(
        candidateDirectory,
        "provincias.json"
      )
    );

  const currentCantones =
    readJson<Canton[]>(
      path.join(
        generatedDirectory,
        "cantones.json"
      )
    );

  const candidateCantones =
    readJson<Canton[]>(
      path.join(
        candidateDirectory,
        "cantones.json"
      )
    );

  const currentDistritos =
    readJson<Distrito[]>(
      path.join(
        generatedDirectory,
        "distritos.json"
      )
    );

  const candidateDistritos =
    readJson<Distrito[]>(
      path.join(
        candidateDirectory,
        "distritos.json"
      )
    );

  const provinceComparison =
    compareRecords(
      currentProvincias,
      candidateProvincias,
      []
    );

  const cantonComparison =
    compareRecords(
      currentCantones,
      candidateCantones,
      ["provinciaCodigo"]
    );

  const districtComparison =
    compareRecords(
      currentDistritos,
      candidateDistritos,
      [
        "provinciaCodigo",
        "cantonCodigo",
      ]
    );

  const catalogChanged =
    currentMetadata.catalogVersion !==
      candidateMetadata.catalogVersion ||
    hasDifferences(provinceComparison) ||
    hasDifferences(cantonComparison) ||
    hasDifferences(districtComparison);

  const sourceHashChanged =
    status.latestSourceSha256 !==
    status.publishedSourceSha256;

  if (
    !catalogChanged &&
    !sourceHashChanged
  ) {
    console.log(
      "[DTA] La fuente candidata coincide con el catálogo publicado."
    );

    fs.rmSync(candidateDirectory, {
      recursive: true,
      force: true,
    });

    return;
  }

  const report = createReport(
    currentMetadata,
    candidateMetadata,
    provinceComparison,
    cantonComparison,
    districtComparison,
    status
  );

  for (const filename of [
    "provincias.json",
    "cantones.json",
    "distritos.json",
    "metadata.json",
  ]) {
    fs.copyFileSync(
      path.join(
        candidateDirectory,
        filename
      ),
      path.join(
        generatedDirectory,
        filename
      )
    );
  }

  fs.writeFileSync(
    reportPath,
    report,
    "utf8"
  );

  const preparedAt =
    new Date().toISOString();

  const preparedStatus: UpdateStatus = {
    ...status,
    status: "up-to-date",
    catalogVersion: version,
    latestAvailableVersion: version,
    publishedSourceUrl: sourceUrl,
    publishedSourceSha256:
      status.latestSourceSha256,
    lastCatalogUpdateAt: preparedAt,
    sourceChangedAt: null,
    updateAvailable: false,
    checkResult: "success",
    message:
      "La actualización oficial fue preparada automáticamente y está pendiente de revisión.",
  };

  writeJson(
    statusPath,
    preparedStatus
  );

  fs.rmSync(candidateDirectory, {
    recursive: true,
    force: true,
  });

  console.log("");
  console.log(
    "Actualización candidata preparada:"
  );
  console.log(
    `- Versión: ${version}`
  );
  console.log(
    `- Reporte: ${reportPath}`
  );
  console.log(
    "- Estado: pendiente de revisión mediante Pull Request"
  );
}

void main();
