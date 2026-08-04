"use client";

import dynamic from "next/dynamic";

import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(
  () => import("swagger-ui-react"),
  {
    ssr: false,
    loading: () => (
      <p style={{ padding: "2rem" }}>
        Cargando documentación…
      </p>
    ),
  }
);

export function SwaggerClient() {
  return (
    <SwaggerUI
      url="/api/v1/openapi.json"
      deepLinking
      displayRequestDuration
      docExpansion="list"
      filter
      tryItOutEnabled
    />
  );
}
