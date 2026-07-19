## Módulos

---

{{#each modules}}
#### {{this.name}}

| Campo | Valor |
|-------|-------|
| **Ruta** | `{{this.path}}` |
| **Archivos** | {{this.files}} |
{{#if this.layers}}
| **Capas** | {{this.layers}} |
{{/if}}

---

{{/each}}

> Los módulos fueron detectados a partir de la estructura de directorios del proyecto.
