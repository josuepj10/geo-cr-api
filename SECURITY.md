# Política de seguridad

## Versión soportada

Actualmente se mantiene:

```text
/api/v1
```

## Reportar una vulnerabilidad

No publique información sensible directamente en una incidencia pública.

Utilice la opción privada de reporte de vulnerabilidades disponible en la pestaña Security del repositorio de GitHub.

Incluya:

- Descripción del problema.
- Endpoint o componente afectado.
- Pasos para reproducirlo.
- Impacto potencial.
- Evidencia mínima.
- Propuesta de corrección, cuando corresponda.

## Alcance

Son relevantes, entre otros:

- Ejecución de código.
- Inyección.
- Denegación de servicio.
- Exposición de secretos.
- Dependencias vulnerables.
- Manipulación no autorizada de archivos.
- Configuración insegura de CORS.
- Alteración del proceso automático de actualización.
- Creación maliciosa de catálogos candidatos.

## Datos personales

Geo CR API no solicita ni almacena información personal de las personas que consumen la API.

Los endpoints públicos son de solo lectura.
