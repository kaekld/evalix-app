"use client";

import { CalendarDays, Clock, ListChecks } from "lucide-react";
import { Card } from "@/components/ui";
import type { Examen } from "./types";

const estadoStyles: Record<string, string> = {
  pendiente: "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
  publicada: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
  finalizada: "bg-[var(--color-user-btn-bg)] text-[var(--color-text-secondary)]",
  cancelada: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
};

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ExamenCard({ examen }: { examen: Examen }) {
  return (
    <Card variant="bordered" padding="none" className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-[var(--color-text-primary)]">
            {examen.titulo}
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
            {examen.grupoNombre} · {examen.grupoCodigo}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
            estadoStyles[examen.estado] ?? estadoStyles.pendiente
          }`}
        >
          {examen.estado}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-secondary)]">
        <span className="flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatFecha(examen.fecha_inicio)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {examen.tiempo_examen} min
        </span>
        <span className="flex items-center gap-1">
          <ListChecks className="h-3.5 w-3.5" />
          {examen.preguntas?.length ?? 0} preguntas
        </span>
      </div>
    </Card>
  );
}
