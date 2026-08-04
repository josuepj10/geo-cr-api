import { NextResponse } from "next/server";

import {
  cacheHeaders,
  catalogMetadata,
  getCanton,
  getDistrito,
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
  const distrito = getDistrito(codigo);

  if (!distrito) {
    return NextResponse.json(
      {
        error: {
          code: "DISTRITO_NOT_FOUND",
          message:
            "No se encontró el distrito solicitado.",
        },
      },
      {
        status: 404,
        headers: cacheHeaders,
      }
    );
  }

  const canton = getCanton(
    distrito.cantonCodigo
  );

  const provincia = getProvincia(
    distrito.provinciaCodigo
  );

  return NextResponse.json(
    {
      data: distrito,
      metadata: {
        catalogVersion:
          catalogMetadata.catalogVersion,
        provincia: provincia ?? null,
        canton: canton ?? null,
      },
    },
    {
      status: 200,
      headers: cacheHeaders,
    }
  );
}
