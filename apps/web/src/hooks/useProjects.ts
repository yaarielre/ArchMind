import { useState, useCallback } from "react";
import { getProjects, getProject, uploadProject } from "../api/client";
import type { Project } from "../types";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar proyectos");
    } finally {
      setLoading(false);
    }
  }, []);

  return { projects, loading, error, fetchProjects };
}

export function useProject() {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProject(id);
      setProject(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar proyecto");
    } finally {
      setLoading(false);
    }
  }, []);

  return { project, loading, error, fetchProject, setProject };
}

export function useUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<Project | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await uploadProject(file);
      return res.data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir proyecto");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { upload, loading, error };
}
