# Contribuir a Geo CR API

Gracias por su interés en contribuir.

## Reportar errores territoriales

Para reportar un nombre, código o relación territorial incorrecta, incluya:

1. Código territorial afectado.
2. Nombre publicado actualmente.
3. Valor que considera correcto.
4. Fuente oficial que respalda el cambio.
5. Enlace o referencia al documento oficial.

No se aceptarán modificaciones territoriales sustentadas únicamente en fuentes informales.

## Preparar el entorno

```bash
git clone https://github.com/josuepj10/geo-cr-api.git
cd geo-cr-api
npm ci
```

## Crear una rama

```bash
git checkout -b fix/descripcion-corta
```

## Ejecutar controles

```bash
npm run lint
npm test
npm run build
```

## Convención de commits

Ejemplos:

```text
feat: agregar nuevo endpoint
fix: corregir relación territorial
docs: actualizar documentación
test: agregar validaciones
ci: actualizar workflow
chore: actualizar dependencias
```

## Cambios en los datos

No edite manualmente los archivos de `data/generated` sin actualizar o ejecutar también el proceso de importación.

Los archivos deben regenerarse mediante:

```bash
npm run import:dta
```

Toda actualización territorial debe incluir:

- Fuente oficial.
- Versión territorial.
- Reporte comparativo.
- Pruebas aprobadas.
- Revisión mediante Pull Request.

## Compatibilidad de la API

Los cambios incompatibles con `/api/v1` deben discutirse previamente y publicarse mediante una nueva versión mayor de la API.
