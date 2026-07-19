## Estadísticas

---

### Resumen del Código Fuente

| Métrica | Valor |
|---------|-------|
| **Archivos Totales** | {{statistics.totalFiles}} |
| **Carpetas Totales** | {{statistics.totalFolders}} |

---

### Líneas por Lenguaje

| Lenguaje | Líneas | Proporción |
|----------|--------|------------|
{{#each statistics.linesByLanguage}}
| {{this.name}} | {{this.lines}} | - |
{{/each}}

> Estadísticas generadas a partir del análisis del código fuente.
