import { useEffect } from "react";
import { FolderOpen, Sparkles } from "lucide-react";
import { useProjects } from "../hooks";
import { SkeletonCard } from "../components/Skeleton";
import { Link, useNavigate } from "react-router-dom";

function countNodes(nodes: { type: string; children?: unknown[] }[]): {
  files: number;
  dirs: number;
} {
  let files = 0;
  let dirs = 0;
  for (const node of nodes) {
    if (node.type === "file") files++;
    if (node.type === "directory") {
      dirs++;
      if (node.children) {
        const sub = countNodes(
          node.children as { type: string; children?: unknown[] }[],
        );
        files += sub.files;
        dirs += sub.dirs;
      }
    }
  }
  return { files, dirs };
}

export function Dashboard() {
  const { projects, loading, fetchProjects } = useProjects();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
      <p className="text-sm text-white/60 mb-8">
        Proyectos analizados por ArchMind
      </p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No hay proyectos</p>
          <p className="text-sm">
            Sube un archivo ZIP para comenzar el analisis
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const treeStats = project.analysis?.tree
              ? countNodes(project.analysis.tree)
              : { files: 0, dirs: 0 };

            return (
              <div
                key={project.id}
                className="group flex flex-col p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:border-blue-400/40 hover:bg-white/15 transition-all"
              >
                <Link to={`/project/${project.id}`} className="block flex-1">
                  <h3 className="font-semibold text-white mb-2 truncate group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-xs text-white/50 mb-3">
                    {treeStats.files} archivos
                    {" / "}
                    {treeStats.dirs} carpetas
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.analysis?.frameworks.slice(0, 2).map((fw) => (
                      <span
                        key={fw.name}
                        className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full font-medium"
                      >
                        {fw.name}
                      </span>
                    ))}
                    {(project.analysis?.frameworks.length ?? 0) > 2 && (
                      <span className="px-2 py-0.5 bg-white/5 text-white/40 text-xs rounded-full">
                        +{project.analysis!.frameworks.length - 2}
                      </span>
                    )}
                    {project.analysis?.languages.slice(0, 2).map((lang) => (
                      <span
                        key={lang.name}
                        className="px-2 py-0.5 bg-white/10 text-white/70 text-xs rounded-full font-medium"
                      >
                        {lang.name}
                      </span>
                    ))}
                    {(project.analysis?.languages.length ?? 0) > 2 && (
                      <span className="px-2 py-0.5 bg-white/5 text-white/40 text-xs rounded-full">
                        +{project.analysis!.languages.length - 2}
                      </span>
                    )}
                  </div>
                </Link>
                <button
                  onClick={() => navigate(`/project/${project.id}/ai`)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-4 cursor-pointer bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-medium rounded-lg hover:bg-purple-600/30 hover:border-purple-500/50 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generar con AI
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
