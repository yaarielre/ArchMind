import type { KnowledgeModel } from "../../knowledge/domain/entities/KnowledgeModel.js";

const SECTION_ANALYSIS_PROMPTS: Record<string, string> = {
  "executive-summary": `Eres un arquitecto de software senior. Analiza el siguiente proyecto y escribe un Resumen Ejecutivo completo.

PRIMERO: Explica que es el proyecto, para que sirve, cual es su objetivo principal y a que dominio pertenece (salud, finanzas, educacion, e-commerce, etc). Infer esto de la estructura de carpetas, los nombres de modulos, las dependencias y el README si existe.

SEGUNDO: Describe la audiencia objetivo, las caracteristicas principales del sistema y el estado actual (version, madurez).

NO generes tablas ni listas de datos. Solo escribe parrafos analiticos claros y profesionales.
Responde en español.`,

  "architecture": `Eres un arquitecto de software senior. Analiza la arquitectura del proyecto y escribe un analisis cualitativo.
Explica por que se selecciono este patron, como interactuan los modulos, ventajas y areas de mejora.
NO generes tablas, listas de capas ni estructura de arbol. Solo escribe parrafos analiticos.
Responde en español.`,

  "stack": `Eres un arquitecto de software senior. Analiza el stack tecnologico del proyecto.
Explica cada eleccion de tecnologia, por que encaja, ventajas y posibles alternativas.
NO generes tablas. Solo escribe parrafos analiticos.
Responde en español.`,

  "dependencies": `Eres un arquitecto de software senior. Analiza las dependencias del proyecto.
Identifica las dependencias criticas, agrupa por categoria y explica su impacto en el proyecto.
NO generes tablas. Solo escribe parrafos analiticos.
Responde en español.`,

  "modules": `Eres un arquitecto de software senior. Analiza los modulos del proyecto.
Explica la responsabilidad de cada modulo, como se relacionan entre si y la calidad de la separacion.
NO generes tablas. Solo escribe parrafos analiticos.
Responde en español.`,

  "statistics": `Eres un arquitecto de software senior. Analiza las metricas del proyecto.
Interpreta el tamano, complejidad, distribucion de lenguajes y lo que esto implica para mantenibilidad.
NO generes tablas ni numeros exactos. Solo escribe parrafos analiticos con insights.
Responde en español.`,

  "recommendations": `Eres un arquitecto de software senior. Analiza el proyecto y escribe recomendaciones accionables.
Enfocate en arquitectura, testing, seguridad, performance y mantenibilidad. Sé especifico y practico.
NO generes tablas. Solo escribe parrafos con recomendaciones concretas.
Responde en español.`,
};

export class PromptBuilder {
  buildSystemPrompt(): string {
    return `Eres un experto en documentacion tecnica de software.
Escribes analisis claros, profesionales y accionables.
Nunca inventas informacion - solo usas los datos proporcionados.
IMPORTANTE: Responde SIEMPRE en español.
IMPORTANTE: NO generes tablas Markdown ni estructuras de datos.
IMPORTANTE: NO generes listas con viñetas de datos tecnicos.
Solo genera parrafos de analisis cualitativo: explicaciones, insights, recomendaciones y conclusiones.`;
  }

  buildCondensedKnowledge(knowledge: KnowledgeModel): string {
    const deps = knowledge.dependencies.production.slice(0, 15).map((d) => `${d.name} (${d.purpose})`).join(", ");
    const mods = knowledge.modules.map((m) => `${m.name}: ${m.files} archivos, capas [${m.layers.join(", ")}]`).join("; ");

    return `Proyecto: ${knowledge.project.name}
Descripcion: ${knowledge.project.description || "N/A"}
Version: ${knowledge.project.version}
Runtime: ${knowledge.stack.runtime || "N/A"}
Framework: ${knowledge.stack.framework || "N/A"}
Lenguajes: ${knowledge.stack.languages.join(", ")}
Base de datos: ${knowledge.stack.database || "N/A"}
ORM: ${knowledge.stack.orm || "N/A"}
Testing: ${knowledge.stack.testing || "N/A"}
Bundler: ${knowledge.stack.bundler || "N/A"}
Gestor de paquetes: ${knowledge.stack.packageManager || "N/A"}
Arquitectura: ${knowledge.architecture.pattern} (${Math.round(knowledge.architecture.confidence * 100)}% confianza)
Capas: ${knowledge.architecture.layers.join(", ")}
Archivos: ${knowledge.statistics.totalFiles}
Carpetas: ${knowledge.statistics.totalFolders}
Lineas por lenguaje: ${Object.entries(knowledge.statistics.linesByLanguage).map(([l, n]) => `${l}: ${n}`).join(", ")}
Dependencias principales: ${deps}
Modulos: ${mods}`;
  }

  buildSectionAnalysis(sectionId: string, knowledge: KnowledgeModel): string {
    const prompt = SECTION_ANALYSIS_PROMPTS[sectionId] ?? `Analiza la seccion "${sectionId}" del proyecto y escribe un analisis cualitativo.`;
    return `${prompt}\n\n## Datos del Proyecto\n\n${this.buildCondensedKnowledge(knowledge)}`;
  }

  buildBatchAnalysis(sectionIds: string[], knowledge: KnowledgeModel): string {
    const sectionNames = sectionIds.map((id) => SECTION_ANALYSIS_PROMPTS[id] ? `- ${id}` : `- ${id}`).join("\n");
    return `Eres un experto en documentacion tecnica. Analiza las siguientes secciones del proyecto.

## Secciones a Analizar

${sectionNames}

## Datos del Proyecto

${this.buildCondensedKnowledge(knowledge)}

---

Para cada seccion, escribe un analisis cualitativo en parrafos.
NO generes tablas ni listas de datos.
Responde en español.
Para cada seccion, usa el formato: ## Titulo de Seccion
y escribe tu analisis debajo en parrafos.`;
  }
}
