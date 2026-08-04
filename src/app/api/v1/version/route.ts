export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  return Response.json(
    {
      data: {
        apiVersion: "v1",
        projectVersion: "0.1.0",
        catalogVersion: null,
        catalogStatus: "pending",
      },
      metadata: {
        service: "geo-cr-api",
        source: "IGN/SNIT",
        officialService: false,
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    }
  );
}
