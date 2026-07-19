## Resumen Ejecutivo

{{project.description}}

---

### Descripcion General

| Campo | Valor |
|-------|-------|
| **Nombre** | {{project.name}} |
| **Version** | {{project.version}} |
| **Punto de Entrada** | {{project.entryPoint}} |
| **Runtime** | {{stack.runtime}} |
| **Framework** | {{stack.framework}} |
| **Base de Datos** | {{stack.database}} |
| **Archivos Totales** | {{statistics.totalFiles}} |
| **Carpetas Totales** | {{statistics.totalFolders}} |

---

### Lenguajes Utilizados

| Lenguaje | Lineas Estimadas |
|----------|-----------------|
{{#each statistics.linesByLanguage}}
| {{this.name}} | {{this.lines}} |
{{/each}}

---

### Stack Principal

| Categoria | Tecnologia |
|-----------|------------|
| **Framework** | {{stack.framework}} |
| **Runtime** | {{stack.runtime}} |
| **Base de Datos** | {{stack.database}} |
| **ORM** | {{stack.orm}} |
| **Testing** | {{stack.testing}} |
| **Bundler** | {{stack.bundler}} |
