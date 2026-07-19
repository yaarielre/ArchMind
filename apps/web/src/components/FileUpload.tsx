import { useCallback, useState, useRef } from "react";
import {
  Upload,
  FileArchive,
  CheckCircle,
  Loader2,
  CloudUpload,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  loading?: boolean;
}

export function FileUpload({ onUpload, loading: externalLoading }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (f.name.endsWith(".zip")) {
      setFile(f);
      setDone(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!file) return;
    try {
      await onUpload(file);
      setDone(true);
      setFile(null);
    } catch {
      // error handled by parent
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative w-full rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer
          transition-all duration-300 group
          ${dragging
            ? "border-blue-400 bg-blue-500/15 scale-[1.02] shadow-lg shadow-blue-500/15"
            : file
              ? "border-blue-400/50 bg-slate-900/60"
              : "border-white/20 hover:border-white/35 hover:bg-white/5"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {file ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center">
              <FileArchive className="w-8 h-8 text-blue-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{file.name}</p>
              <p className="text-xs text-white/50 mt-0.5">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <p className="text-xs text-white/40">
              Click para cambiar archivo
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className={`
              w-16 h-16 rounded-2xl flex items-center justify-center transition-colors
              ${dragging
                ? "bg-blue-500/20 border border-blue-400/40"
                : "bg-white/5 border border-white/15 group-hover:bg-white/10 group-hover:border-white/25"
              }
            `}>
              <CloudUpload className={`w-8 h-8 transition-colors ${dragging ? "text-blue-300" : "text-white/50"}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">
                Arrastra tu proyecto aqui
              </p>
              <p className="text-xs text-white/45 mt-1">
                o haz click para seleccionar
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/45">
              <FileArchive className="w-3 h-3" />
              Solo archivos .zip
            </span>
          </div>
        )}
      </div>

      {/* Upload button */}
      {file && (
        <button
          onClick={handleUpload}
          disabled={externalLoading}
          className="w-full max-w-lg py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/25"
        >
          {externalLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Subiendo proyecto...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Subir y Analizar
            </>
          )}
        </button>
      )}

      {/* Success message */}
      {done && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-400/25 text-emerald-300 text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          Proyecto subido correctamente
        </div>
      )}

      {/* Features */}
      {!file && !done && (
        <div className="grid grid-cols-3 gap-4 w-full mt-2">
          {[
            { icon: Zap, label: "Analisis automatico", desc: "Al subir" },
            { icon: ShieldCheck, label: "62+ lenguajes", desc: "Detectados" },
            { icon: FileArchive, label: "Multi-framework", desc: "Soportado" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="text-center">
              <Icon className="w-4 h-4 text-white/35 mx-auto mb-1.5" />
              <p className="text-xs font-medium text-white/55">{label}</p>
              <p className="text-[10px] text-white/35">{desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
