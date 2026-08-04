import { NextResponse } from "next/server";

import { cacheHeaders } from "@/lib/catalog";
import { openApiDocument } from "@/lib/openapi";

export const dynamic = "force-static";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    openApiDocument,
    {
      status: 200,
      headers: cacheHeaders,
    }
  );
}
