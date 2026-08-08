import { ImageResponse } from "next/og";

export const alt =
  "Geo CR API - API de provincias, cantones y distritos de Costa Rica";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px",
          background: "#020617",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#6ee7b7",
          }}
        >
          Geo CR API
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "1000px",
          }}
        >
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            Provincias, cantones y distritos de Costa Rica
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 32,
              fontSize: 30,
              color: "#cbd5e1",
            }}
          >
            API pública · JSON · DTA 2026 · OpenAPI
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#94a3b8",
          }}
        >
          geo-cr-api.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
