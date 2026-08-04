import { NextResponse } from "next/server";

import {
  cacheHeaders,
  catalogMetadata,
  getCanton,
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
  const canton = getCanton(codigo);

  if (!canton) {
    return NextResponse.json(
      {
        error: {
          code: "CANTON_NOT_FOUND",
          message:
            "No se encontró el cantón solicitado.",
        },
      },
      {
        status: 404,
        headers: cacheHeaders,
      }
    );
  }

  const provincia = getProvincia(
    canton.provinciaCodigo
  );

  return NextResponse.json(
    {
      data: canton,
      metadata: {
        catalogVersion:
          catalogMetadata.catalogVersion,
        provincia: provincia ?? null,
      },
    },
    {
      status: 200,
      headers: cacheHeaders,
    }
  );
}
