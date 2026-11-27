"use client";

import { useState, useCallback, useEffect } from "react";

interface Docente {
  id: string;
  nombre_completo: string;
  correo: string;
}

interface GrupoDetalle {
  id: string;
  nombre: string;
  codigo: string;
  categoria: string;
  descripcion: string | null;
  creado_en: string;
  docente: Docente | null;
}

interface EvaluacionResumen {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'programada' | 'publicada' | 'en_curso' | 'finalizada' | 'cancelada';
  tiempo_examen: number;
  orden_aleatorio: boolean;
  mi_estado: 'pending' | 'completed' | 'in_progress' | 'not_started';
}

interface AlumnoInscrito {
  id: string;
  nombre_completo: string;
  correo: string;
  inscrito_en: string;
}

interface Estadisticas {
  total_evaluaciones: number;
  total_alumnos: number;
  evaluaciones_proximas: number;
  evaluaciones_completadas: number;
}

interface GrupoDetalleResponse {
  grupo: GrupoDetalle;
  evaluaciones: {
    proximas: EvaluacionResumen[];
    en_curso: EvaluacionResumen[];
    completadas: EvaluacionResumen[];
    canceladas: EvaluacionResumen[];
  };
  alumnos: AlumnoInscrito[];
  estadisticas: Estadisticas;
}

interface UseGrupoDetalleReturn {
  data: GrupoDetalleResponse | null;
  loading: boolean;
  error: string | null;
  fetchDetalle: (grupoId: string) => Promise<void>;
  clear: () => void;
}

export function useGrupoDetalle(): UseGrupoDetalleReturn {
  const [data, setData] = useState<GrupoDetalleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetalle = useCallback(async (grupoId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/alumno/grupos/${grupoId}/detalle`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al cargar detalle del grupo');
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, fetchDetalle, clear };
}