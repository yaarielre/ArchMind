import type { KnowledgeModel } from "../../knowledge/domain/entities/KnowledgeModel.js";

export interface SectionData {
  project: KnowledgeModel["project"];
  stack: KnowledgeModel["stack"];
  architecture: KnowledgeModel["architecture"];
  statistics: KnowledgeModel["statistics"];
  dependencies: KnowledgeModel["dependencies"];
  modules: KnowledgeModel["modules"];
  structure: KnowledgeModel["structure"];
}

export class SectionGenerator {
  generateData(knowledge: KnowledgeModel): SectionData {
    return {
      project: knowledge.project,
      stack: knowledge.stack,
      architecture: knowledge.architecture,
      statistics: {
        ...knowledge.statistics,
        linesByLanguage: Object.entries(knowledge.statistics.linesByLanguage).map(
          ([name, lines]) => ({ name, lines })
        ),
      } as never,
      dependencies: knowledge.dependencies,
      modules: knowledge.modules,
      structure: knowledge.structure,
    };
  }
}
