import type { SectionType } from "../types";

export interface SectionConfig {
  id: SectionType;
  label: string;
  description: string;
  icon: string;
}

export const SECTIONS: SectionConfig[] = [
  {
    id: "executive-summary",
    label: "Resumen Ejecutivo",
    description: "Descripcion general del proyecto, stack tecnologico y metricas clave",
    icon: "FileText",
  },
  {
    id: "architecture",
    label: "Arquitectura",
    description: "Patron de diseno, capas, modulos y como interactuan entre si",
    icon: "Layers",
  },
  {
    id: "stack",
    label: "Stack Tecnologico",
    description: "Lenguajes, frameworks, base de datos, ORM, testing y herramientas",
    icon: "Wrench",
  },
  {
    id: "dependencies",
    label: "Dependencias",
    description: "Paquetes de produccion y desarrollo con su proposito",
    icon: "Package",
  },
  {
    id: "modules",
    label: "Modulos",
    description: "Organizacion del codigo por carpetas y responsabilidades",
    icon: "FolderTree",
  },
  {
    id: "statistics",
    label: "Estadisticas",
    description: "Metricas del codigo fuente: archivos, carpetas, lineas por lenguaje",
    icon: "BarChart3",
  },
  {
    id: "recommendations",
    label: "Recomendaciones",
    description: "Sugerencias accionables de arquitectura, testing, seguridad y performance",
    icon: "Lightbulb",
  },
];

export const ALL_SECTION_IDS = SECTIONS.map((s) => s.id);
