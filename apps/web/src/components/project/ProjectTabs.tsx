import { Brain, FileText, ChevronRight, Check, Lock } from "lucide-react";
import type { Tab } from "../../pages/ProjectDetail";

const TABS: { id: Tab; label: string; icon: typeof Brain }[] = [
  { id: "analysis", label: "Analisis", icon: ChevronRight },
  { id: "knowledge", label: "Knowledge Model", icon: Brain },
  { id: "docs", label: "Documentacion", icon: FileText },
];

export function ProjectTabs({
  active,
  stepsCompleted,
  onTabClick,
}: {
  active: Tab;
  stepsCompleted: Record<Tab, boolean>;
  onTabClick: (tab: Tab) => void;
}) {
  const isUnlocked = (tabId: Tab): boolean => {
    switch (tabId) {
      case "analysis":
        return true;
      case "knowledge":
        return stepsCompleted.analysis;
      case "docs":
        return stepsCompleted.knowledge;
    }
  };

  return (
    <div className="flex gap-1 border-b border-white/20 mb-6">
      {TABS.map(({ id: tabId, label, icon: Icon }) => {
        const unlocked = isUnlocked(tabId);
        const completed = stepsCompleted[tabId];
        return (
          <button
            key={tabId}
            onClick={() => onTabClick(tabId)}
            disabled={!unlocked}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              active === tabId
                ? "border-blue-400 text-blue-400"
                : unlocked
                  ? "border-transparent text-white/50 hover:text-white/80"
                  : "border-transparent text-white/25 cursor-not-allowed"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {completed && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            {!unlocked && <Lock className="w-3.5 h-3.5 text-white/30" />}
          </button>
        );
      })}
    </div>
  );
}
