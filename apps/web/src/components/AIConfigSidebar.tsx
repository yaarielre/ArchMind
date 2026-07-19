import { useState } from "react";
import { Settings, Eye, EyeOff, RotateCcw, ChevronDown, Sparkles } from "lucide-react";
import { loadAIConfig, saveAIConfig, resetAIConfig, NVIDIA_MODEL_PRESETS } from "../config/ai";
import type { AIConfig } from "../types";

interface AIConfigSidebarProps {
  onConfigChange?: (config: AIConfig) => void;
}

export function AIConfigSidebar({ onConfigChange }: AIConfigSidebarProps) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<AIConfig>(() => loadAIConfig());
  const [showKey, setShowKey] = useState(false);

  const update = (field: keyof AIConfig, val: string) => {
    const next = { ...config, [field]: val };
    setConfig(next);
    saveAIConfig(next);
    onConfigChange?.(next);
  };

  const handleReset = () => {
    const defaults = resetAIConfig();
    setConfig(defaults);
    onConfigChange?.(defaults);
  };

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/[0.08] hover:text-white transition-all duration-200 group"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/20 group-hover:border-purple-400/30 transition-colors">
          <Sparkles className="w-4 h-4 text-purple-300/80" />
        </div>
        <span className="flex-1 text-left">Configuracion de IA</span>
        <ChevronDown
          className={`w-4 h-4 text-white/40 transition-transform duration-300 ease-out ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-3 pb-3 pt-1 space-y-3">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <Field
            label="Provider"
            value={config.provider}
            onChange={(v) => update("provider", v)}
            placeholder="nvidia-openai"
          />

          <div>
            <label className="block text-[10px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">
              Modelo
            </label>
            <div className="relative">
              <select
                value={config.model}
                onChange={(e) => update("model", e.target.value)}
                className="w-full appearance-none px-3 py-2 bg-white/[0.06] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all cursor-pointer hover:bg-white/[0.08]"
              >
                {NVIDIA_MODEL_PRESETS.map((model) => (
                  <option key={model.id} value={model.id} className="bg-slate-900 text-white">
                    {model.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
            </div>
            <p className="mt-1.5 text-[10px] leading-relaxed text-white/30">
              {NVIDIA_MODEL_PRESETS.find((m) => m.id === config.model)?.description ?? "Selecciona uno de los modelos NVIDIA disponibles."}
            </p>
          </div>

          <Field
            label="Base URL"
            value={config.baseUrl}
            onChange={(v) => update("baseUrl", v)}
            placeholder="https://..."
          />

          <div className="relative">
            <Field
              label="API Key"
              value={config.apiKey}
              onChange={(v) => update("apiKey", v)}
              placeholder="nvapi-..."
              type={showKey ? "text" : "password"}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-[30px] text-white/30 hover:text-white/60 transition-colors"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/60 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Restaurar valores por defecto
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-white/[0.06] border border-white/10 rounded-lg text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all hover:bg-white/[0.08]"
      />
    </div>
  );
}
