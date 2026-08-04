import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

type CatalogMetadata = {
  catalogVersion: string;
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

type SourceCandidate = {
  year: number;
  url: string;
};

type DownloadedSource = SourceCandidate & {
  sha256: string;
  sizeBytes: number;
};

const rootDirectory = process.cwd();

const metadataPath = path.join(
  rootDirectory,
  "data",
  "generated",
  "metadata.json"
);

const statusPath = path.join(
  rootDirectory,
  "data",
  "generated",
  "update-status.json"
);

const sourcePageUrl =
  "https://www.snitcr.go.cr/ign_repositorio";

const sourceUrlForYear = (year: number): string =>
  `https://www.snitcr.go.cr/pdfs/ign_repositorio/` +
  `DTA-TABLA%20POR%20PROVINCIA-CANT%C3%93N-DISTRITO%20${year}.xlsx`;

const argumentsList = new Set(process.argv.slice(2));

const initialize =
  argumentsList.has("--initialize");

const acceptCurrent =
  argumentsList.has("--accept-current");

function readJson<T>(
  filename: string
): T {
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

function readExistingStatus():
  | UpdateStatus
  | null {
  if (!fs.existsSync(statusPath)) {
    return null;
  }

  return readJson<UpdateStatus>(statusPath);
}

function calculateSha256(
  content: Buffer
): string {
  return crypto
    .createHash("sha256")
    .update(content)
    .digest("hex");
}



function isXlsxBuffer(
  content: Buffer
): boolean {
  return (
    content.length > 4 &&
    content[0] === 0x50 &&
    content[1] === 0x4b
  );
}

async function downloadSource(
  candidate: SourceCandidate
): Promise<DownloadedSource | null> {
  try {
    const response = await fetch(
      candidate.url,
      {
        headers: {
          "User-Agent":
            "geo-cr-api-update-monitor/0.1",
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream",
        },
        signal: AbortSignal.timeout(30_000),
      }
    );

    if (!response.ok) {
      return null;
    }

    const content = Buffer.from(
      await response.arrayBuffer()
    );

    if (!isXlsxBuffer(content)) {
      return null;
    }

    return {
      ...candidate,
      sha256: calculateSha256(content),
      sizeBytes: content.length,
    };
  } catch {
    return null;
  }
}

function extractCandidatesFromHtml(
  html: string
): SourceCandidate[] {
  const candidates = new Map<
    string,
    SourceCandidate
  >();

  const linkPattern =
    /(?:href|src)=["']([^"']+\.xlsx(?:\?[^"']*)?)["']/gi;

  for (
    let match = linkPattern.exec(html);
    match !== null;
    match = linkPattern.exec(html)
  ) {
    const rawLink = match[1]
      .replaceAll("&amp;", "&");

    let url: string;

    try {
      url = new URL(
        rawLink,
        sourcePageUrl
      ).toString();
    } catch {
      continue;
    }

    const decodedUrl =
      decodeURIComponent(url);

    if (
      !decodedUrl
        .toLocaleUpperCase("es-CR")
        .includes("DTA-TABLA")
    ) {
      continue;
    }

    const yearMatch =
      decodedUrl.match(/20\d{2}/g);

    if (!yearMatch?.length) {
      continue;
    }

    const year = Number.parseInt(
      yearMatch.at(-1) as string,
      10
    );

    candidates.set(url, {
      year,
      url,
    });
  }

  return [...candidates.values()];
}

async function discoverCandidates():
  Promise<SourceCandidate[]> {
  const candidates = new Map<
    string,
    SourceCandidate
  >();

  try {
    const response = await fetch(
      sourcePageUrl,
      {
        headers: {
          "User-Agent":
            "geo-cr-api-update-monitor/0.1",
          Accept: "text/html",
        },
        signal: AbortSignal.timeout(20_000),
      }
    );

    if (response.ok) {
      const html = await response.text();

      for (
        const candidate of
          extractCandidatesFromHtml(html)
      ) {
        candidates.set(
          candidate.url,
          candidate
        );
      }
    }
  } catch {
    // Se utilizarán las direcciones predecibles.
  }

  const currentYear =
    new Date().getUTCFullYear();

  for (
    let year = currentYear + 2;
    year >= 2024;
    year -= 1
  ) {
    const url = sourceUrlForYear(year);

    candidates.set(url, {
      year,
      url,
    });
  }

  return [...candidates.values()].sort(
    (a, b) => b.year - a.year
  );
}

async function findLatestSource():
  Promise<DownloadedSource> {
  const candidates =
    await discoverCandidates();

  for (const candidate of candidates) {
    console.log(
      `[DTA] Comprobando ${candidate.year}: ${candidate.url}`
    );

    const downloaded =
      await downloadSource(candidate);

    if (downloaded) {
      return downloaded;
    }
  }

  throw new Error(
    "No se encontró un archivo XLSX territorial válido en el SNIT."
  );
}

async function main(): Promise<void> {
  const checkedAt =
    new Date().toISOString();

  const metadata =
    readJson<CatalogMetadata>(
      metadataPath
    );

  const existingStatus =
    readExistingStatus();

  try {
    const latest =
      await findLatestSource();

    const latestVersion =
      `DTA-${latest.year}`;

    const establishBaseline =
      initialize ||
      acceptCurrent ||
      existingStatus === null;

    const publishedSha256 =
      establishBaseline
        ? latest.sha256
        : existingStatus
            .publishedSourceSha256;

    const publishedSourceUrl =
      establishBaseline
        ? latest.url
        : existingStatus
            .publishedSourceUrl;

    const updateAvailable =
      establishBaseline
        ? false
        : latestVersion !==
            metadata.catalogVersion ||
          latest.sha256 !==
            publishedSha256;

    const lastCatalogUpdateAt =
      acceptCurrent ||
      existingStatus === null
        ? checkedAt
        : existingStatus
            .lastCatalogUpdateAt;

    const sourceChangedAt =
      updateAvailable
        ? existingStatus
              ?.sourceChangedAt ??
          checkedAt
        : null;

    const status: UpdateStatus = {
      status: updateAvailable
        ? "update-available"
        : "up-to-date",
      catalogVersion:
        metadata.catalogVersion,
      latestAvailableVersion:
        latestVersion,
      publishedSourceUrl,
      publishedSourceSha256:
        publishedSha256,
      latestSourceUrl: latest.url,
      latestSourceSha256:
        latest.sha256,
      lastCheckedAt: checkedAt,
      lastCatalogUpdateAt,
      sourceChangedAt,
      updateAvailable,
      checkResult: "success",
      message: updateAvailable
        ? "Se detectó una actualización o modificación en la fuente oficial."
        : "El catálogo publicado coincide con la fuente oficial comprobada.",
    };

    writeJson(statusPath, status);

    console.log("");
    console.log(
      "Comprobación DTA completada:"
    );
    console.log(
      `- Versión publicada: ${metadata.catalogVersion}`
    );
    console.log(
      `- Versión disponible: ${latestVersion}`
    );
    console.log(
      `- Tamaño: ${latest.sizeBytes} bytes`
    );
    console.log(
      `- SHA-256: ${latest.sha256}`
    );
    console.log(
      `- Actualización disponible: ${updateAvailable ? "sí" : "no"}`
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error desconocido";

    if (!existingStatus) {
      throw error;
    }

    const failedStatus: UpdateStatus = {
      ...existingStatus,
      status: "check-failed",
      lastCheckedAt: checkedAt,
      checkResult: "error",
      message,
    };

    writeJson(
      statusPath,
      failedStatus
    );

    console.error(
      `[DTA] La comprobación falló: ${message}`
    );

    process.exitCode = 1;
  }
}

void main();
