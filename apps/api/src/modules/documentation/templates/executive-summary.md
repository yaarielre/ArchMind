## Resumen Ejecutivo

{{project.description}}

---

### Descripción General

| Campo | Valor |
|-------|-------|
| **Versión** | {{project.version}} |
| **Punto de Entrada** | {{project.entryPoint}} |
| **Runtime** | {{stack.runtime}} |
| **Framework** | {{stack.framework}} |
| **Archivos Totales** | {{statistics.totalFiles}} |
| **Carpetas Totales** | {{statistics.totalFolders}} |

---

### Lenguajes Utilizados

| Lenguaje | Líneas de Código |
|----------|-----------------|
{{#each statistics.linesByLanguage}}
| {{this.name}} | {{this.lines}} |
{{/each}}
