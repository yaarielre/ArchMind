import { useNavigate } from "react-router-dom";
import { useUpload } from "../hooks";
import { FileUpload } from "../components/FileUpload";
import { useToast } from "../components/Toast";

export function Upload() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { upload, loading } = useUpload();

  const handleUpload = async (file: File) => {
    const project = await upload(file);
    if (project) {
      toast("success", `Proyecto "${project.name}" subido correctamente`);
      navigate(`/project/${project.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">
          Subir Proyecto
        </h1>
        <p className="text-sm text-white/50 max-w-md mx-auto">
          Sube un archivo ZIP con el codigo fuente de tu proyecto para iniciar
          el analisis automatico
        </p>
      </div>

      <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/10 p-10">
        <FileUpload onUpload={handleUpload} loading={loading} />
      </div>
    </div>
  );
}
