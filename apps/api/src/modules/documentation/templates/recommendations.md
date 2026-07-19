## Recomendaciones

---

### Base de Datos

{{#if stack.database}}
| Campo | Valor |
|-------|-------|
| **Motor detectado** | {{stack.database}} |
| **ORM** | {{stack.orm}} |

- Definir una estrategia de migraciones y backups antes de produccion.
- Configurar indices en las tablas/coleccion mas consultadas.
- Implementar connection pooling para manejar concurrencia.
{{/if}}

{{#unless stack.database}}
- Evaluar la necesidad de una base de datos segun la naturaleza del proyecto.
- Si se requiere persistencia, considerar SQLite para prototipos o PostgreSQL/MongoDB para produccion.
- Definir el esquema de datos antes de escribir codigo de acceso.
{{/unless}}

---

### Testing

{{#if stack.testing}}
| Campo | Valor |
|-------|-------|
| **Framework detectado** | {{stack.testing}} |
| **Objetivo** | Cobertura superior al 80% |

- Mantener cobertura de tests superior al 80%.
- Configurar pipeline de CI con ejecucion automatica de tests.
- Escribir tests de integracion para los flujos criticos del negocio.
{{/if}}

{{#unless stack.testing}}
- **Accion urgente:** Agregar un framework de testing (Jest, Vitest, Pytest, etc.).
- Crear tests unitarios para la logica de negocio principal.
- Implementar tests de integracion para endpoints/API.
- Configurar cobertura minima del 70% como regla de calidad.
{{/unless}}

---

### Framework

{{#if stack.framework}}
| Campo | Valor |
|-------|-------|
| **Framework detectado** | {{stack.framework}} |

- Seguir la guia de estilo oficial y las mejores practicas documentadas.
- Mantener el framework actualizado para recibir correcciones de seguridad.
- Aprovechar las features nativas antes de agregar dependencias externas.
{{/if}}

---

### Arquitectura

| Campo | Valor |
|-------|-------|
| **Patron detectado** | {{architecture.pattern}} |
| **Confianza** | {{architecture.confidence}} |

- Mantener la separacion por capas consistente en todo el proyecto.
- Evitar dependencias circulares entre modulos.
- Documentar las decisiones de arquitectura en un ADR (Architecture Decision Record).

---

### Modulos

{{#each modules}}
- **{{this.name}}:** Evaluar implementar inyeccion de dependencias para mejorar la testabilidad y el acoplamiento.
{{/each}}

---

### Seguridad

- Revisar dependencias periodicamente con `npm audit` o equivalente.
- Implementar rate limiting en endpoints publicos.
- Validar y sanitizar todas las entradas del usuario.
- Usar variables de entorno para secretos, nunca hardcodear.

---

> Estas recomendaciones son generadas automaticamente basandose en el stack tecnologico detectado.
