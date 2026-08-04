import { NextResponse } from "next/server";

import {
  cacheHeaders,
  catalogMetadata,
  getCatalog,
} from "@/lib/catalog";

export const dynamic = "force-static";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      data: getCatalog(),
      metadata: catalogMetadata,
    },
    {
      status: 200,
      headers: {
        ...cacheHeaders,
        "Content-Disposition":
          'inline; filename="geo-cr-dta-2026.json"',
      },
    }
  );
}
