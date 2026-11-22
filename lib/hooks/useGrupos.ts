"use client";

import { useState, useCallback } from "react";

export interface Grupo {
  id: string;
  nombre: string;
  codigo: string;
  materia: string;
  descripcion: string | null;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
  institucion_id: string;
  estudiantes_count: number;
  expanded?: boolean; // Local UI state
}

export interface CreateGrupoDTO {
  nombre: string;
  codigo: string;
  materia: string;
  descripcion?: string;
}

export interface UpdateGrupoDTO {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

export function useGrupos() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrupos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/docente/grupos");
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al cargar grupos");
      }
      const data = await res.json();
      setGrupos(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createGrupo = useCallback(async (data: CreateGrupoDTO): Promise<Grupo> => {
    setError(null);
    try {
      const res = await fetch("/api/docente/grupos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al crear grupo");
      }
      const newGrupo = await res.json();
      setGrupos((prev) => [newGrupo, ...prev]);
      return newGrupo;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
      throw err;
    }
  }, []);

  const updateGrupo = useCallback(async (id: string, data: UpdateGrupoDTO): Promise<Grupo> => {
    setError(null);
    try {
      const res = await fetch(`/api/docente/grupos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al actualizar grupo");
      }
      const updatedGrupo = await res.json();
      setGrupos((prev) => prev.map((g) => (g.id === id ? updatedGrupo : g)));
      return updatedGrupo;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
      throw err;
    }
  }, []);

  const deleteGrupo = useCallback(async (id: string): Promise<void> => {
    setError(null);
    try {
      const res = await fetch(`/api/docente/grupos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al eliminar grupo");
      }
      setGrupos((prev) => prev.filter((g) => g.id !== id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
      throw err;
    }
  }, []);

  return {
    grupos,
    loading,
    error,
    fetchGrupos,
    createGrupo,
    updateGrupo,
    deleteGrupo,
  };
}