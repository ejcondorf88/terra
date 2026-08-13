# 🚀 Acceso rápido a la documentación

**Empieza por aquí según tu rol.**

---

## Para ejecutivos / stakeholders

```bash
# Resumen ejecutivo (1 página, 5 minutos)
code docs/EXECUTIVE-SUMMARY.md

# Diagrama visual (5 minutos)
code docs/architecture-c4-level2.md

# Timeline de desarrollo (5 minutos)
code docs/roadmap-implementation.md
```

**Resultado:** Presentación de 15 minutos lista.

---

## Para tech leads / arquitectos

```bash
# Índice maestro (empieza aquí)
code docs/INDEX.md

# Análisis técnico completo
code docs/engineering-analysis.md

# Diagrama C4 con nuevos módulos
code docs/architecture-c4-level2.md

# Especificaciones técnicas
code docs/terra-link-technical.md

# Plan de sprints
code docs/roadmap-implementation.md
```

**Resultado:** Comprensión completa de estado, arquitectura y roadmap.

---

## Para backend developers

```bash
# Setup local
code docs/development-guide.md

# Endpoints y módulos
code docs/terra-link-technical.md

# Referencia de API
code docs/api-reference.md

# Qué construir primero
code docs/roadmap-implementation.md

# Seguridad y RBAC
code docs/RBAC_GUARD_GUIDE.md
code docs/MULTI_TENANT_AUTH_GUIDE.md
```

**Resultado:** Listo para empezar a programar inmediatamente.

---

## Para QA engineers

```bash
# Casos de prueba
code docs/qa-test-plan.md

# Guía de testing
code docs/testing-guide.md

# Endpoints a probar
code docs/terra-link-technical.md

# Estrategia de QA
code docs/qa-guide.md
```

**Resultado:** Plan de testing listo.

---

## Para product managers

```bash
# Resumen ejecutivo
code docs/EXECUTIVE-SUMMARY.md

# Análisis de ingeniería
code docs/engineering-analysis.md

# Modelo de negocio y precios
code docs/api-cost-model.md

# Plan de sprints
code docs/roadmap-implementation.md
```

**Resultado:** Visión completa de negocio y desarrollo.

---

## Para security / compliance

```bash
# Políticas de seguridad
code docs/security.md

# Control de acceso
code docs/RBAC_GUARD_GUIDE.md

# Brechas de seguridad y soluciones
code docs/engineering-analysis.md

# Módulo de auditoría
code docs/architecture-c4-level2.md
```

**Resultado:** Checklist de seguridad implementado.

---

## Para todos – búsqueda por tema

```bash
# Índice maestro (búsqueda temática)
code docs/INDEX.md

# Estado actual de documentación
code docs/DOCUMENTATION-STATUS.md

# Visión general del ecosistema
code docs/architecture.md
```

---

## Atajos desde la terminal

### Navegar rápido
```bash
# Ir a docs
cd docs/

# Listar todos los documentos
ls -la

# Ver último documento creado
ls -lt
```

### Ver en el navegador (si GitHub Actions)
```bash
# Abrir en navegador el index
open https://github.com/AGTECH-EC/terra-link/tree/main/docs

# O si tienes server local
python -m http.server 8000 --directory docs/
# Luego: http://localhost:8000
```

---

## En VS Code

### Abrir rápidamente
```
Ctrl+P (o Cmd+P en Mac)
docs/engineering-analysis.md
```

### Búsqueda de texto
```
Ctrl+Shift+F (o Cmd+Shift+F)
Buscar términos: "minting", "EUDR", "BlockchainMintService", etc.
```

### Breadcrumbs
```
Ctrl+Shift+. (o Cmd+Shift+.)
Navegación rápida entre secciones dentro de un documento
```

---

## Flujos de búsqueda por problema

### "¿Dónde está el análisis completo?"
→ [engineering-analysis.md](docs/engineering-analysis.md)

### "¿Cuál es el plan de desarrollo?"
→ [roadmap-implementation.md](docs/roadmap-implementation.md)

### "¿Cómo es la arquitectura?"
→ [architecture-c4-level2.md](docs/architecture-c4-level2.md)

### "¿Cuáles son los endpoints?"
→ [terra-link-technical.md](docs/terra-link-technical.md)

### "¿Qué debo probar?"
→ [qa-test-plan.md](docs/qa-test-plan.md)

### "¿Cuáles son las brechas de seguridad?"
→ [engineering-analysis.md](docs/engineering-analysis.md) sección 3 + [security.md](docs/security.md)

### "¿Cuánto cuesta operar?"
→ [api-cost-model.md](docs/api-cost-model.md)

### "¿Cuál es el modelo de negocio?"
→ [EXECUTIVE-SUMMARY.md](docs/EXECUTIVE-SUMMARY.md) + [api-cost-model.md](docs/api-cost-model.md)

### "¿Qué módulos existen y cuáles hay que crear?"
→ [architecture-c4-level2.md](docs/architecture-c4-level2.md)

### "¿Por dónde empiezo?"
→ [INDEX.md](docs/INDEX.md)

---

## Importar/Exportar documentación

### Como PDF (en VS Code)
```
1. Abre documento en VS Code
2. Markdown Preview: Ctrl+Shift+V
3. Imprime a PDF: Ctrl+P → "Imprimir a PDF"
```

### Copiar a Confluence / Notion
```
1. Abre documento en navegador
2. Markdown se renderiza automáticamente en GitHub
3. Copia-pega el contenido HTML
```

### Generar tabla de contenidos
```bash
# Con herramientas como markdown-toc
npm install -g markdown-toc
markdown-toc docs/engineering-analysis.md
```

---

## Mantener la documentación actualizada

### Checklist semanal
- [ ] Actualizar [roadmap-implementation.md](docs/roadmap-implementation.md) si hay cambios de scope
- [ ] Actualizar [architecture-c4-level2.md](docs/architecture-c4-level2.md) si hay nuevos módulos
- [ ] Actualizar [terra-link-technical.md](docs/terra-link-technical.md) si hay nuevos endpoints
- [ ] Actualizar [qa-test-plan.md](docs/qa-test-plan.md) si hay nuevas áreas a probar
- [ ] Actualizar [security.md](docs/security.md) si hay cambios de seguridad

### Al cerrar un issue
1. Referencia el documento principal ([roadmap-implementation.md](docs/roadmap-implementation.md))
2. Marca como completado
3. Actualiza documentación asociada

---

## Comando maestro (abre todo)

```bash
# Abre los 5 documentos principales en VS Code
code docs/EXECUTIVE-SUMMARY.md \
     docs/engineering-analysis.md \
     docs/architecture-c4-level2.md \
     docs/roadmap-implementation.md \
     docs/INDEX.md
```

---

## Próximo paso

**Ya tienes toda la documentación.** Ahora:

1. Elige tu rol en [INDEX.md](docs/INDEX.md)
2. Lee los documentos en el orden sugerido
3. ¡Comienza a desarrollar!

---

**Generado:** 2026-06-23  
**Última actualización:** [DOCUMENTATION-STATUS.md](docs/DOCUMENTATION-STATUS.md)
