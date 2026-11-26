"use client";

import { useState, useCallback } from "react";

export interface AlumnoExamen {
  id: string;
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'programada' | 'publicada' | 'en_curso' | 'finalizada' | 'cancelada';
  tiempo_examen: number;
}

export interface AlumnoGrupo {
  id: string;
  nombre: string;
  codigo: string;
  categoria: string;
  descripcion: string | null;
  inscrito_en: string;
  examenes: AlumnoExamen[];
}

export function useAlumnoGrupos() {
  const [grupos, setGrupos] = useState<AlumnoGrupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrupos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/alumno/grupos");
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

  return {
    grupos,
    loading,
    error,
    fetchGrupos,
  };
}