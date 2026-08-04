import { NextResponse } from "next/server";

import { updateStatus } from "@/lib/update-status";

export const dynamic = "force-static";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      data: updateStatus,
      metadata: {
        service: "geo-cr-api",
        source: "IGN/SNIT",
        automaticCheck: true,
        checkFrequency: "monthly",
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control":
          "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
        "Content-Type":
          "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, OPTIONS",
      },
    }
  );
}
