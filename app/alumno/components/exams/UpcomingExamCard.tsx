"use client";

import { Button } from "@/components/ui";
import { Calendar, Clock, AlertCircle, CheckCircle, Clock as ClockIcon } from "lucide-react";

interface UpcomingExamCardProps {
  subject: string;
  unit: string;
  fecha_inicio: string;
  fecha_fin: string;
  tiempo_examen: number;
  questionCount?: number;
  onEnter: () => void;
  onViewDetails?: () => void;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(fechaInicio: string) {
  const now = new Date();
  const inicio = new Date(fechaInicio);
  const diffMs = inicio.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  if (diffMs < 0) {
    return { label: "EN CURSO", className: "bg-[var(--color-success-bg)] text-[var(--color-success)]", icon: CheckCircle };
  }
  if (diffDays === 0) {
    if (diffHours <= 2) {
      return { label: "EMPIEZA PRONTO", className: "bg-[var(--color-danger-bg)] text-[var(--color-danger)] animate-pulse", icon: AlertCircle };
    }
    return { label: "HOY", className: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]", icon: AlertCircle };
  }
  if (diffDays === 1) {
    return { label: "MAÑANA", className: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]", icon: ClockIcon };
  }
  return { label: "PRÓXIMO", className: "bg-[var(--color-primary-light)] text-[var(--color-primary)]", icon: Calendar };
}

export default function UpcomingExamCard({
  subject,
  unit,
  fecha_inicio,
  fecha_fin,
  tiempo_examen,
  questionCount,
  onEnter,
  onViewDetails,
}: UpcomingExamCardProps) {
  const status = getStatusBadge(fecha_inicio);
  const StatusIcon = status.icon;

  return (
    <section>
      <div className="bg-white border border-[var(--color-border)] border-l-4 border-[var(--color-primary)] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-background)] border-b border-[var(--color-border)]">
          <h2 className="font-semibold text-sm text-[var(--color-text-primary)]">
            Evaluación por Empezar
          </h2>
          <div className="flex items-center gap-2">
            {questionCount && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                {questionCount} preguntas
              </span>
            )}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.className}`}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Subject & Title */}
          <div className="space-y-0.5">
            <p className="font-medium text-sm text-[var(--color-primary)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
              {subject}
            </p>
            <h3 className="font-semibold text-lg text-[var(--color-text-primary)]">
              {unit}
            </h3>
          </div>

          {/* Info Grid - Compact */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[var(--color-background)] rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-[var(--color-text-secondary)] mb-0.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Inicio</span>
              </div>
              <p className="font-semibold text-sm text-[var(--color-text-primary)]">
                {formatDateTime(fecha_inicio)}
              </p>
            </div>

            <div className="bg-[var(--color-background)] rounded-lg p-3 text-center border-x border-[var(--color-border)]">
              <div className="flex items-center justify-center gap-1 text-xs text-[var(--color-text-secondary)] mb-0.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Duración</span>
              </div>
              <p className="font-semibold text-sm text-[var(--color-text-primary)]">
                {tiempo_examen} min
              </p>
            </div>

            <div className="bg-[var(--color-background)] rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-[var(--color-text-secondary)] mb-0.5">
                <ClockIcon className="h-3.5 w-3.5" />
                <span>Fin</span>
              </div>
              <p className="font-semibold text-sm text-[var(--color-text-primary)]">
                {formatTime(fecha_fin)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <Button
              onClick={onEnter}
              className="flex-1 bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity py-2.5 font-medium"
              size="lg"
            >
              Entrar a evaluación
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}