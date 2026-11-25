"use client";

import { useCallback, useEffect, useState } from "react";
import CrearExamenModal from "./CrearExamenModal";
import ExamenList from "./ExamenList";
import type { Examen, GrupoOption } from "./types";

interface ExamenesPanelProps {
  grupos: GrupoOption[];
}

export default function ExamenesPanel({ grupos }: ExamenesPanelProps) {
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExamenes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/docente/examenes");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al cargar exámenes");
      setExamenes(data as Examen[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar exámenes");
    } finally {
      setLoading(false);
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect -- fetchExamenes actualiza el estado esperadamente */
  useEffect(() => {
    fetchExamenes();
  }, [fetchExamenes]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleCreated = (examen: Examen) => {
    setExamenes((prev) => [examen, ...prev]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-semibold text-4xl leading-relaxed tracking-tight text-[var(--color-text-primary)]">
            Evaluaciones
          </h1>
          <p className="mt-1 text-base text-[var(--color-text-secondary)]">
            Crea y consulta los exámenes de tus grupos
          </p>
        </div>
        <CrearExamenModal grupos={grupos} onCreated={handleCreated} />
      </div>

      <ExamenList examenes={examenes} loading={loading} error={error} />
    </div>
  );
}
