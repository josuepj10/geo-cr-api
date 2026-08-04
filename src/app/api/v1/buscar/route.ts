import { NextResponse } from "next/server";

import {
  cacheHeaders,
  catalogMetadata,
  searchCatalog,
} from "@/lib/catalog";

export async function GET(
  request: Request
): Promise<NextResponse> {
  const url = new URL(request.url);

  const query =
    url.searchParams.get("q")?.trim() ?? "";

  const rawLimit =
    url.searchParams.get("limite");

  if (!query) {
    return NextResponse.json(
      {
        error: {
          code: "SEARCH_QUERY_REQUIRED",
          message:
            'Debe proporcionar el parámetro de búsqueda "q".',
        },
      },
      {
        status: 400,
        headers: cacheHeaders,
      }
    );
  }

  let limit = 25;

  if (rawLimit !== null) {
    const parsedLimit =
      Number.parseInt(rawLimit, 10);

    if (
      !Number.isInteger(parsedLimit) ||
      parsedLimit < 1 ||
      parsedLimit > 50
    ) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_SEARCH_LIMIT",
            message:
              'El parámetro "limite" debe ser un número entre 1 y 50.',
          },
        },
        {
          status: 400,
          headers: cacheHeaders,
        }
      );
    }

    limit = parsedLimit;
  }

  const results = searchCatalog(
    query,
    limit
  );

  return NextResponse.json(
    {
      data: results,
      metadata: {
        catalogVersion:
          catalogMetadata.catalogVersion,
        query,
        limit,
        count: results.length,
      },
    },
    {
      status: 200,
      headers: cacheHeaders,
    }
  );
}
