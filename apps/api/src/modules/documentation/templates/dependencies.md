## Dependencias

---

### Producción

| Paquete | Versión | Propósito |
|---------|---------|-----------|
{{#each dependencies.production}}
| `{{this.name}}` | {{this.version}} | {{this.purpose}} |
{{/each}}

---

### Desarrollo

| Paquete | Versión | Propósito |
|---------|---------|-----------|
{{#each dependencies.development}}
| `{{this.name}}` | {{this.version}} | {{this.purpose}} |
{{/each}}

> Las dependencias fueron extraídas del archivo de configuración del proyecto.
