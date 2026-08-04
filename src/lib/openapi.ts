import { catalogMetadata } from "@/lib/catalog";

const jsonContent = {
  "application/json": {
    schema: {
      type: "object",
    },
  },
};

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Geo CR API",
    version: "0.2.0",
    description:
      "API pública y no oficial para consultar la División Territorial Administrativa de Costa Rica.",
    contact: {
      name: "Geo CR API",
      url: "https://github.com/josuepj10/geo-cr-api",
    },
  },
  servers: [
    {
      url: "/",
      description: "Servidor actual",
    },
  ],
  tags: [
    {
      name: "Sistema",
    },
    {
      name: "Provincias",
    },
    {
      name: "Cantones",
    },
    {
      name: "Distritos",
    },
    {
      name: "Búsqueda",
    },
    {
      name: "Catálogo",
    },
  ],
  paths: {
    "/api/v1/health": {
      get: {
        tags: ["Sistema"],
        summary: "Consultar salud del servicio",
        responses: {
          "200": {
            description: "Servicio disponible",
            content: jsonContent,
          },
        },
      },
    },
    "/api/v1/version": {
      get: {
        tags: ["Sistema"],
        summary: "Consultar versiones y conteos",
        responses: {
          "200": {
            description:
              "Información de la API y del catálogo",
            content: jsonContent,
          },
        },
      },
    },
    "/api/v1/provincias": {
      get: {
        tags: ["Provincias"],
        summary: "Listar provincias",
        responses: {
          "200": {
            description:
              "Lista de provincias",
            content: jsonContent,
          },
        },
      },
    },
    "/api/v1/provincias/{codigo}": {
      get: {
        tags: ["Provincias"],
        summary:
          "Consultar una provincia",
        parameters: [
          {
            name: "codigo",
            in: "path",
            required: true,
            schema: {
              type: "string",
              pattern: "^[1-7]$",
            },
            example: "2",
          },
        ],
        responses: {
          "200": {
            description:
              "Provincia encontrada",
            content: jsonContent,
          },
          "404": {
            description:
              "Provincia no encontrada",
            content: jsonContent,
          },
        },
      },
    },
    "/api/v1/provincias/{codigo}/cantones": {
      get: {
        tags: ["Cantones"],
        summary:
          "Listar cantones de una provincia",
        parameters: [
          {
            name: "codigo",
            in: "path",
            required: true,
            schema: {
              type: "string",
              pattern: "^[1-7]$",
            },
            example: "2",
          },
        ],
        responses: {
          "200": {
            description:
              "Cantones de la provincia",
            content: jsonContent,
          },
          "404": {
            description:
              "Provincia no encontrada",
            content: jsonContent,
          },
        },
      },
    },
    "/api/v1/cantones/{codigo}": {
      get: {
        tags: ["Cantones"],
        summary: "Consultar un cantón",
        parameters: [
          {
            name: "codigo",
            in: "path",
            required: true,
            schema: {
              type: "string",
              pattern: "^\\d{3}$",
            },
            example: "202",
          },
        ],
        responses: {
          "200": {
            description:
              "Cantón encontrado",
            content: jsonContent,
          },
          "404": {
            description:
              "Cantón no encontrado",
            content: jsonContent,
          },
        },
      },
    },
    "/api/v1/cantones/{codigo}/distritos": {
      get: {
        tags: ["Distritos"],
        summary:
          "Listar distritos de un cantón",
        parameters: [
          {
            name: "codigo",
            in: "path",
            required: true,
            schema: {
              type: "string",
              pattern: "^\\d{3}$",
            },
            example: "202",
          },
        ],
        responses: {
          "200": {
            description:
              "Distritos del cantón",
            content: jsonContent,
          },
          "404": {
            description:
              "Cantón no encontrado",
            content: jsonContent,
          },
        },
      },
    },
    "/api/v1/distritos/{codigo}": {
      get: {
        tags: ["Distritos"],
        summary:
          "Consultar un distrito",
        parameters: [
          {
            name: "codigo",
            in: "path",
            required: true,
            schema: {
              type: "string",
              pattern: "^\\d{5}$",
            },
            example: "20205",
          },
        ],
        responses: {
          "200": {
            description:
              "Distrito encontrado",
            content: jsonContent,
          },
          "404": {
            description:
              "Distrito no encontrado",
            content: jsonContent,
          },
        },
      },
    },
    "/api/v1/buscar": {
      get: {
        tags: ["Búsqueda"],
        summary:
          "Buscar provincias, cantones y distritos",
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            description:
              "Nombre parcial, nombre completo o código territorial.",
            schema: {
              type: "string",
            },
            example: "San Ramón",
          },
          {
            name: "limite",
            in: "query",
            required: false,
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 50,
              default: 25,
            },
          },
        ],
        responses: {
          "200": {
            description:
              "Resultados encontrados",
            content: jsonContent,
          },
          "400": {
            description:
              "Parámetros inválidos",
            content: jsonContent,
          },
        },
      },
    },
    "/api/v1/catalogo": {
      get: {
        tags: ["Catálogo"],
        summary:
          "Descargar el catálogo completo",
        responses: {
          "200": {
            description:
              "Provincias, cantones, distritos y metadatos",
            content: jsonContent,
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Provincia: {
        type: "object",
        required: [
          "codigo",
          "nombre",
          "areaKm2",
        ],
        properties: {
          codigo: {
            type: "string",
            example: "2",
          },
          nombre: {
            type: "string",
            example: "Alajuela",
          },
          areaKm2: {
            type: "number",
            example: 9772.079431,
          },
        },
      },
      Canton: {
        type: "object",
        required: [
          "codigo",
          "nombre",
          "provinciaCodigo",
          "areaKm2",
        ],
        properties: {
          codigo: {
            type: "string",
            example: "202",
          },
          nombre: {
            type: "string",
            example: "San Ramón",
          },
          provinciaCodigo: {
            type: "string",
            example: "2",
          },
          areaKm2: {
            type: "number",
            example: 1021.74,
          },
        },
      },
      Distrito: {
        type: "object",
        required: [
          "codigo",
          "nombre",
          "cantonCodigo",
          "provinciaCodigo",
          "areaKm2",
        ],
        properties: {
          codigo: {
            type: "string",
            example: "20205",
          },
          nombre: {
            type: "string",
            example: "Piedades Sur",
          },
          cantonCodigo: {
            type: "string",
            example: "202",
          },
          provinciaCodigo: {
            type: "string",
            example: "2",
          },
          areaKm2: {
            type: "number",
            example: 115.63,
          },
        },
      },
    },
  },
  "x-catalog-version":
    catalogMetadata.catalogVersion,
  "x-data-source":
    catalogMetadata.source.institution,
};
