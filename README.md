# Geo CR API

API pública, gratuita y de código abierto para consultar provincias, cantones y distritos de Costa Rica.

El catálogo publicado se deriva de la División Territorial Administrativa del Instituto Geográfico Nacional y del Sistema Nacional de Información Territorial.

> Geo CR API es un proyecto independiente y no constituye un servicio oficial del Gobierno de Costa Rica, del IGN, del SNIT ni de Correos de Costa Rica.

## Sitio público

- Portal: https://geo-cr-api.vercel.app
- Documentación interactiva: https://geo-cr-api.vercel.app/docs
- OpenAPI: https://geo-cr-api.vercel.app/api/v1/openapi.json
- Catálogo completo: https://geo-cr-api.vercel.app/api/v1/catalogo
- Estado de actualización: https://geo-cr-api.vercel.app/api/v1/actualizacion

## Catálogo actual

| Entidad | Cantidad |
|---|---:|
| Provincias | 7 |
| Cantones | 84 |
| Distritos | 494 |

Versión territorial publicada: `DTA-2026`.

## Uso rápido

### Listar provincias

```bash
curl https://geo-cr-api.vercel.app/api/v1/provincias
```

### Consultar una provincia

```bash
curl https://geo-cr-api.vercel.app/api/v1/provincias/2
```

### Listar cantones de una provincia

```bash
curl https://geo-cr-api.vercel.app/api/v1/provincias/2/cantones
```

### Listar distritos de un cantón

```bash
curl https://geo-cr-api.vercel.app/api/v1/cantones/202/distritos
```

### Consultar un distrito

```bash
curl https://geo-cr-api.vercel.app/api/v1/distritos/20205
```

### Buscar por nombre

```bash
curl "https://geo-cr-api.vercel.app/api/v1/buscar?q=san%20ramon"
```

### Buscar por código

```bash
curl "https://geo-cr-api.vercel.app/api/v1/buscar?q=20205"
```

## Ejemplo con JavaScript

```javascript
const response = await fetch(
  "https://geo-cr-api.vercel.app/api/v1/cantones/202/distritos"
);

if (!response.ok) {
  throw new Error(`Error HTTP: ${response.status}`);
}

const result = await response.json();

console.log(result.data);
```

## Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/v1/health` | Estado del servicio |
| GET | `/api/v1/version` | Versiones y conteos |
| GET | `/api/v1/actualizacion` | Estado de actualización del catálogo |
| GET | `/api/v1/provincias` | Listar provincias |
| GET | `/api/v1/provincias/{codigo}` | Consultar una provincia |
| GET | `/api/v1/provincias/{codigo}/cantones` | Cantones de una provincia |
| GET | `/api/v1/cantones/{codigo}` | Consultar un cantón |
| GET | `/api/v1/cantones/{codigo}/distritos` | Distritos de un cantón |
| GET | `/api/v1/distritos/{codigo}` | Consultar un distrito |
| GET | `/api/v1/buscar?q=` | Buscar por nombre o código |
| GET | `/api/v1/catalogo` | Obtener el catálogo completo |
| GET | `/api/v1/openapi.json` | Especificación OpenAPI |

## Actualizaciones automáticas

GitHub Actions comprueba mensualmente la fuente oficial.

El proceso:

1. Busca la versión territorial más reciente.
2. Descarga el archivo oficial.
3. Calcula su hash SHA-256.
4. Compara el archivo con la versión publicada.
5. Registra la fecha de la última comprobación.
6. Si detecta cambios, genera un catálogo candidato.
7. Compara altas, bajas y modificaciones territoriales.
8. Abre un Pull Request en borrador para revisión humana.

Los datos nunca se fusionan automáticamente con `main`.

## Desarrollo local

Requisitos:

- Node.js 24.
- npm.
- Git.

Instalar dependencias:

```bash
npm ci
```

Ejecutar localmente:

```bash
npm run dev
```

Abrir:

```text
http://localhost:3000
```

## Verificaciones

```bash
npm run lint
npm test
npm run build
npm audit --audit-level=high
```

## Importar el catálogo

El archivo oficial debe colocarse localmente en:

```text
data/source/DTA-2026.xlsx
```

Ejecutar:

```bash
npm run import:dta
```

También puede indicar parámetros:

```bash
npm run import:dta -- \
  --source "data/source/DTA-2026.xlsx" \
  --version "DTA-2026" \
  --output "data/update-candidate" \
  --allow-count-change
```

## Comprobar actualizaciones

```bash
npm run check:dta
```

Preparar y comparar una actualización detectada:

```bash
npm run prepare:dta-update
```

## Estructura principal

```text
data/
├── generated/
│   ├── provincias.json
│   ├── cantones.json
│   ├── distritos.json
│   ├── metadata.json
│   └── update-status.json
└── source/

scripts/
├── import-dta.ts
├── check-dta-update.ts
└── prepare-dta-update.ts

src/
├── app/
│   ├── api/v1/
│   └── docs/
└── lib/

tests/
└── catalog.test.ts
```

## Fuente de datos

Consulte:

- [SOURCES.md](SOURCES.md)
- [DATA_LICENSE.md](DATA_LICENSE.md)

## Contribuciones

Consulte [CONTRIBUTING.md](CONTRIBUTING.md).

## Seguridad

Consulte [SECURITY.md](SECURITY.md).

## Licencia

El código fuente desarrollado para Geo CR API se distribuye bajo la licencia MIT.

La licencia MIT no se aplica automáticamente a documentos o datos pertenecientes a terceros. Consulte [DATA_LICENSE.md](DATA_LICENSE.md).
