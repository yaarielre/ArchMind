import type { DetectedArchitecture } from "../domain/entities/AnalysisResult.js";

interface ArchitectureRule {
  pattern: string;
  indicators: string[];
  required: number;
}

const ARCHITECTURES: ArchitectureRule[] = [
  {
    pattern: "Clean Architecture",
    indicators: ["domain/", "application/", "infrastructure/", "presentation/", "use-cases/", "entities/", "repositories/"],
    required: 3,
  },
  {
    pattern: "Hexagonal (Ports & Adapters)",
    indicators: ["ports/", "adapters/", "domain/", "infrastructure/", "inbound/", "outbound/"],
    required: 3,
  },
  {
    pattern: "DDD (Domain-Driven Design)",
    indicators: ["domain/", "entities/", "value-objects/", "aggregates/", "repositories/", "services/", "events/"],
    required: 3,
  },
  {
    pattern: "MVC",
    indicators: ["models/", "views/", "controllers/", "Model", "View", "Controller"],
    required: 3,
  },
  {
    pattern: "MVVM",
    indicators: ["models/", "views/", "viewmodels/", "ViewModel", ".vue", ".component.ts"],
    required: 3,
  },
  {
    pattern: "Feature-based",
    indicators: ["features/", "modules/", "shared/", "common/"],
    required: 2,
  },
  {
    pattern: "Monorepo",
    indicators: ["packages/", "apps/", "turbo.json", "pnpm-workspace.yaml", "lerna.json", "nx.json"],
    required: 2,
  },
  {
    pattern: "Microservices",
    indicators: ["services/", "docker-compose.yml", "Dockerfile", "k8s/", "kubernetes/"],
    required: 2,
  },
  {
    pattern: "Layered Architecture",
    indicators: ["controllers/", "services/", "repositories/", "models/", "middlewares/", "utils/"],
    required: 3,
  },
  {
    pattern: "Modular",
    indicators: ["modules/", "components/", "shared/", "core/"],
    required: 2,
  },
];

export class ArchitectureDetector {
  detect(allPaths: string[]): DetectedArchitecture {
    const flatPaths = allPaths.map((p) => p.toLowerCase().replace(/\\/g, "/"));

    let bestMatch: DetectedArchitecture = {
      pattern: "Standard",
      confidence: 0.3,
      indicators: [],
    };

    for (const rule of ARCHITECTURES) {
      const found = rule.indicators.filter((indicator) =>
        flatPaths.some((path) => path.includes(indicator.toLowerCase())),
      );

      // This is evidence strength, not a claim that the architecture is proven.
      // A rule needs its minimum signals to be selected, then earns confidence
      // gradually as more of its independent indicators are present.
      if (found.length < rule.required) continue;
      const coverage = found.length / rule.indicators.length;
      const confidence = Math.min(0.95, 0.25 + coverage * 0.7);

      if (confidence > bestMatch.confidence) {
        bestMatch = { pattern: rule.pattern, confidence, indicators: found };
      }
    }

    return bestMatch;
  }
}
