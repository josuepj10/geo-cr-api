import { NextResponse } from "next/server";

import {
  cacheHeaders,
  catalogMetadata,
  getCantonesByProvincia,
  getProvincia,
} from "@/lib/catalog";

type RouteContext = {
  params: Promise<{
    codigo: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse> {
  const { codigo } = await context.params;
  const provincia = getProvincia(codigo);

  if (!provincia) {
    return NextResponse.json(
      {
        error: {
          code: "PROVINCIA_NOT_FOUND",
          message:
            "No se encontró la provincia solicitada.",
        },
      },
      {
        status: 404,
        headers: cacheHeaders,
      }
    );
  }

  const cantones =
    getCantonesByProvincia(codigo);

  return NextResponse.json(
    {
      data: cantones,
      metadata: {
        catalogVersion:
          catalogMetadata.catalogVersion,
        provincia,
        count: cantones.length,
      },
    },
    {
      status: 200,
      headers: cacheHeaders,
    }
  );
}
