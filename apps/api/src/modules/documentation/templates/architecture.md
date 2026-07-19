## Arquitectura

---

### Patron de Diseno

| Campo | Valor |
|-------|-------|
| **Patron detectado** | {{architecture.pattern}} |
| **Nivel de confianza** | {{architecture.confidence}} |

---

### Capas de la Arquitectura

{{#each architecture.layers}}
- `{{this}}`
{{/each}}

---

### Estructura del Proyecto

```
{{project.name}}/
├── src/
{{#each modules}}
│   ├── {{this.name}}/
{{#if this.layers}}
{{#each this.layers}}
│   │   ├── {{this}}/
{{/each}}
{{/if}}
│   │   └── ... ({{this.files}} archivos)
{{/each}}
├── {{structure.entry}}
{{#if structure.srcDir}}
├── {{structure.srcDir}}/
{{/if}}
{{#each structure.configFiles}}
├── {{this}}
{{/each}}
└── ...
```

---

### Modulos Principales

| Modulo | Ruta | Archivos | Capas |
|--------|------|----------|-------|
{{#each modules}}
| **{{this.name}}** | `{{this.path}}` | {{this.files}} | {{this.layers}} |
{{/each}}

---

### Flujo de Dependencias

```
{{#each architecture.layers}}
{{this}}{{#unless @last}} → {{/unless}}
{{/each}}
```
