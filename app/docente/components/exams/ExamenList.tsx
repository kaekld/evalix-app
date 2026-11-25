"use client";

import ExamenCard from "./ExamenCard";
import type { Examen } from "./types";

interface ExamenListProps {
  examenes: Examen[];
  loading: boolean;
  error: string | null;
}

export default function ExamenList({ examenes, loading, error }: ExamenListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg bg-[var(--color-user-btn-bg)]"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {error}
      </div>
    );
  }

  if (examenes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-border)] px-6 py-10 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Aún no hay exámenes. Crea el primero.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {examenes.map((examen) => (
        <ExamenCard key={examen.id} examen={examen} />
      ))}
    </div>
  );
}
