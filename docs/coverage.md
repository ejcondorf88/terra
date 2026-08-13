# Cobertura de código

Este documento describe cómo se genera y publica el reporte de cobertura consolidado para el ecosistema TERRA.

## Generación local

1. Instalar dependencias y compilar el paquete compartido:
   ```bash
   npm install
   npm run -w @terra/shared build
   ```
2. Ejecutar pruebas con cobertura:
   ```bash
   npm run test:coverage
   ```
3. Verificar que se haya generado el reporte combinado:
   - `coverage/combined/lcov.info`
   - `coverage/combined/html/index.html`

Si el directorio `coverage/combined/html/` no existe, revisa que las pruebas de los workspaces hayan generado `lcov.info`.

## Publicación en GitHub Pages

El workflow `coverage-consolidated.yml` publica automáticamente el reporte HTML consolidado en GitHub Pages cuando se ejecuta en la rama `main` y `coverage/combined/html/index.html` existe.

### URL de Pages

La URL final depende del repositorio de GitHub y de la configuración de Pages. Un ejemplo genérico es:

```text
https://<OWNER>.github.io/<REPO>/
```

Para este repositorio, reemplaza `<OWNER>` y `<REPO>` con los valores reales de GitHub.

## Retención y accesibilidad

- El reporte HTML combinado se actualiza en cada despliegue exitoso en `main`.
- El workflow también sube el reporte a GitHub Actions como artefacto (`coverage-report-html`) durante 30 días.
- Si la publicación en Pages falla, los artefactos siguen estando disponibles en la ejecución del workflow.

## Notas de uso

- Usa Pages cuando quieras una vista rápida de las métricas globales.
- Usa los artefactos del workflow cuando necesites descargar la cobertura detallada de cada workspace.
- Este reporte es complementario a los informes locales; su valor está en la visibilidad inmediata para el equipo.
