import type { AIConfig } from "../types";

const STORAGE_KEY = "archmind-ai-config";

export const NVIDIA_MODEL_PRESETS = [
  {
    id: "nvidia/nemotron-3-ultra-550b-a55b",
    label: "Nemotron 3 Ultra 550B",
    description: "Máxima profundidad para arquitectura y razonamiento complejo.",
  },
  {
    id: "deepseek-ai/deepseek-v4-pro",
    label: "DeepSeek V4 Pro",
    description: "Muy fuerte para análisis técnico, código y documentación detallada.",
  },
  {
    id: "deepseek-ai/deepseek-v4-flash",
    label: "DeepSeek V4 Flash",
    description: "La opción rápida para iterar documentación y análisis técnico.",
  },
  {
    id: "openai/gpt-oss-120b",
    label: "GPT-OSS 120B",
    description: "Equilibrio entre razonamiento, redacción y tiempo de respuesta.",
  },
] as const;

function envOr(key: string, fallback: string): string {
  return import.meta.env[key] || fallback;
}

export const AI_DEFAULTS: AIConfig = {
  provider: envOr("VITE_AI_PROVIDER", "nvidia-openai"),
  apiKey: envOr("VITE_AI_API_KEY", ""),
  baseUrl: envOr("VITE_AI_BASE_URL", "https://integrate.api.nvidia.com/v1"),
  model: envOr("VITE_AI_MODEL", NVIDIA_MODEL_PRESETS[3].id),
};

export function loadAIConfig(): AIConfig {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return { ...AI_DEFAULTS, ...JSON.parse(saved) };
    } catch {
      return { ...AI_DEFAULTS };
    }
  }
  return { ...AI_DEFAULTS };
}

export function saveAIConfig(config: AIConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function resetAIConfig(): AIConfig {
  localStorage.removeItem(STORAGE_KEY);
  return { ...AI_DEFAULTS };
}
