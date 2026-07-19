## Estadisticas

---

### Resumen del Codigo Fuente

| Metrica | Valor |
|---------|-------|
| **Archivos Totales** | {{statistics.totalFiles}} |
| **Carpetas Totales** | {{statistics.totalFolders}} |

---

### Lineas por Lenguaje

| Lenguaje | Lineas Estimadas |
|----------|-----------------|
{{#each statistics.linesByLanguage}}
| {{this.name}} | {{this.lines}} |
{{/each}}

---

### Modulos Detectados

| Modulo | Ruta | Archivos |
|--------|------|----------|
{{#each modules}}
| **{{this.name}}** | `{{this.path}}` | {{this.files}} |
{{/each}}
