## Recomendaciones

---

### Base de Datos

{{#if stack.database}}
- **Motor detectado:** {{stack.database}}
- **ORM:** {{stack.orm}}
- **Acción recomendada:** Definir una estrategia de migraciones y backups antes de producción.
{{/if}}

---

### Testing

{{#if stack.testing}}
- **Framework detectado:** {{stack.testing}}
- **Objetivo:** Mantener cobertura de tests superior al 80%.
- **Acción recomendada:** Configurar pipeline de CI con ejecución automática de tests.
{{/if}}

---

### Framework

{{#if stack.framework}}
- **Framework detectado:** {{stack.framework}}
- **Acción recomendada:** Seguir la guía de estilo oficial y las mejores prácticas documentadas.
{{/if}}

---

### Módulos

{{#each architecture.modules}}
- **{{this}}:** Evaluar implementar inyección de dependencias para mejorar la testabilidad y el acoplamiento.
{{/each}}

---

> Estas recomendaciones son generadas automáticamente basándose en el stack tecnológico detectado.
