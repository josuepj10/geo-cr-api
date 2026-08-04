import { NextResponse } from "next/server";

import {
  cacheHeaders,
  catalogMetadata,
  getProvincias,
} from "@/lib/catalog";

export async function GET(): Promise<NextResponse> {
  const provincias = getProvincias();

  return NextResponse.json(
    {
      data: provincias,
      metadata: {
        catalogVersion:
          catalogMetadata.catalogVersion,
        count: provincias.length,
      },
    },
    {
      status: 200,
      headers: cacheHeaders,
    }
  );
}
