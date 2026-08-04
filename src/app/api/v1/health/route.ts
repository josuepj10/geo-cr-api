export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  return Response.json(
    {
      data: {
        status: "ok",
        service: "geo-cr-api",
      },
      metadata: {
        version: "0.1.0",
        timestamp: new Date().toISOString(),
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    }
  );
}
