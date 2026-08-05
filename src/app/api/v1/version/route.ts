import { NextResponse } from "next/server";

import {
  cacheHeaders,
  catalogMetadata,
} from "@/lib/catalog";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      data: {
        apiVersion: "v1",
        projectVersion: "0.2.0",
        catalogVersion:
          catalogMetadata.catalogVersion,
        catalogStatus: "ready",
        counts: catalogMetadata.counts,
      },
      metadata: {
        service: "geo-cr-api",
        source:
          catalogMetadata.source.institution,
        dataset:
          catalogMetadata.source.dataset,
        officialService: false,
      },
    },
    {
      status: 200,
      headers: cacheHeaders,
    }
  );
}

