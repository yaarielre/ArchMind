import type { KnowledgeModel } from "../../knowledge/domain/entities/KnowledgeModel.js";
import type { DocumentSection } from "../../documentation/domain/entities/DocumentationResult.js";

const SECTION_PROMPTS: Record<string, string> = {
  "executive-summary": `Eres un arquitecto de software senior escribiendo documentación.
Basado en los datos del proyecto, escribe un Resumen Ejecutivo claro y profesional.
Incluye: qué hace el proyecto, su propósito principal, audiencia objetivo y características principales.
Sé conciso pero informativo. Usa formato Markdown.
Responde en español.`,

  "architecture": `Eres un arquitecto de software senior escribiendo documentación.
Basado en los datos del proyecto, escribe una sección de Arquitectura detallada.
Explica el patrón elegido, por qué se seleccionó, cómo interactúan los módulos y la estructura por capas.
Usa formato Markdown con encabezados claros.
Responde en español.`,

  "stack": `Eres un arquitecto de software senior escribiendo documentación.
Basado en los datos del proyecto, escribe una sección de Stack Tecnológico detallada.
Explica cada elección de tecnología y por qué encaja en el proyecto. Incluye lenguajes, frameworks, bases de datos, herramientas.
Usa formato Markdown con tablas donde sea apropiado.
Responde en español.`,

  "dependencies": `Eres un arquitecto de software senior escribiendo documentación.
Basado en los datos del proyecto, escribe una sección de Dependencias detallada.
Agrupa por categoría (UI, base de datos, auth, testing, etc.) y explica el propósito de las dependencias clave.
Usa formato Markdown con tablas.
Responde en español.`,

  "modules": `Eres un arquitecto de software senior escribiendo documentación.
Basado en los datos del proyecto, escribe una sección de Módulos detallada.
Explica la responsabilidad de cada módulo, cómo se relacionan y la organización general del código.
Usa formato Markdown.
Responde en español.`,

  "statistics": `Eres un arquitecto de software senior escribiendo documentación.
Basado en los datos del proyecto, escribe una sección de Estadísticas.
Analiza las métricas del código fuente y proporciona insights sobre el tamaño y complejidad del proyecto.
Usa formato Markdown.
Responde en español.`,

  "recommendations": `Eres un arquitecto de software senior escribiendo documentación.
Basado en los datos del proyecto, escribe Recomendaciones accionables.
Sugiere mejoras para arquitectura, testing, seguridad, performance y mantenibilidad.
Sé específico y práctico. Usa formato Markdown.
Responde en español.`,
};

export class PromptBuilder {
  buildSystemPrompt(knowledge: KnowledgeModel): string {
    return `Eres un experto en documentación técnica de software.
Escribes documentación clara, profesional y accionable.
Siempre usas formato Markdown.
Nunca inventas información - solo usas los datos proporcionados.
Sé conciso pero exhaustivo.
IMPORTANTE: Responde SIEMPRE en español.`;
  }

  buildSectionPrompt(section: DocumentSection, knowledge: KnowledgeModel): string {
    const sectionPrompt = SECTION_PROMPTS[section.id] ?? `Write a detailed ${section.title} section for this project.`;

    return `${sectionPrompt}

## Project Data

### Project Info
- Name: ${knowledge.project.name}
- Description: ${knowledge.project.description || "N/A"}
- Version: ${knowledge.project.version}
- Entry Point: ${knowledge.project.entryPoint}

### Stack
- Languages: ${knowledge.stack.languages.join(", ")}
- Framework: ${knowledge.stack.framework || "N/A"}
- Runtime: ${knowledge.stack.runtime || "N/A"}
- Database: ${knowledge.stack.database || "N/A"}
- ORM: ${knowledge.stack.orm || "N/A"}
- Testing: ${knowledge.stack.testing || "N/A"}
- Package Manager: ${knowledge.stack.packageManager || "N/A"}

### Architecture
- Pattern: ${knowledge.architecture.pattern}
- Confidence: ${knowledge.architecture.confidence}
- Modules: ${knowledge.architecture.modules.join(", ")}
- Layers: ${knowledge.architecture.layers.join(", ")}

### Dependencies (Production)
${knowledge.dependencies.production.map((d) => `- ${d.name} ${d.version} (${d.purpose})`).join("\n") || "None"}

### Dependencies (Development)
${knowledge.dependencies.development.map((d) => `- ${d.name} ${d.version} (${d.purpose})`).join("\n") || "None"}

### Modules
${knowledge.modules.map((m) => `- ${m.name}: ${m.files} files at ${m.path}`).join("\n") || "None"}

### Statistics
- Total Files: ${knowledge.statistics.totalFiles}
- Total Folders: ${knowledge.statistics.totalFolders}
- Lines by Language: ${Object.entries(knowledge.statistics.linesByLanguage).map(([l, n]) => `${l}: ${n}`).join(", ")}

## Current Section Content

${section.content}

---

Rewrite this section using the project data above. Make it professional, detailed, and accurate.
Output ONLY the Markdown for this section. No extra commentary.`;
  }
}
