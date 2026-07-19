import { CheckSquare, Square } from "lucide-react";
import { SECTIONS } from "../config/sections";
import type { SectionType } from "../types";

interface SectionSelectorProps {
  selected: SectionType[];
  onChange: (sections: SectionType[]) => void;
  disabled?: boolean;
}

export function SectionSelector({ selected, onChange, disabled }: SectionSelectorProps) {
  const allSelected = selected.length === SECTIONS.length;

  const toggleAll = () => {
    if (disabled) return;
    onChange(allSelected ? [] : SECTIONS.map((s) => s.id));
  };

  const toggle = (id: SectionType) => {
    if (disabled) return;
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
    );
  };

  return (
    <div className={`space-y-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-white/50 uppercase tracking-wide">
          Secciones a generar
        </p>
        <button
          onClick={toggleAll}
          disabled={disabled}
          className="text-xs text-blue-400 hover:text-blue-300 font-medium disabled:text-white/30"
        >
          {allSelected ? "Deseleccionar todas" : "Seleccionar todas"}
        </button>
      </div>

      {SECTIONS.map((section) => {
        const isActive = selected.includes(section.id);
        return (
          <button
            key={section.id}
            onClick={() => toggle(section.id)}
            disabled={disabled}
            className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors ${
              isActive
                ? "border-blue-400/40 bg-blue-500/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            {isActive ? (
              <CheckSquare className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p
                className={`text-sm font-medium ${isActive ? "text-blue-300" : "text-white/70"}`}
              >
                {section.label}
              </p>
              <p className="text-xs text-white/40 mt-0.5">
                {section.description}
              </p>
            </div>
          </button>
        );
      })}

      {selected.length > 0 && (
        <p className="text-xs text-white/30 pt-1">
          {selected.length} de {SECTIONS.length} seleccionadas
        </p>
      )}
    </div>
  );
}
