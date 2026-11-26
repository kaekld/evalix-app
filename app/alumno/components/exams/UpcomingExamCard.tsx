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
        <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-background)] border-b border-[var(--color-border)]">
          <h2 className="font-semibold text-sm leading-relaxed text-[var(--color-text-primary)]">
            Evaluación por Empezar
          </h2>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.className}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Subject & Title */}
          <div className="space-y-1">
            <p className="font-medium text-sm text-[var(--color-primary)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
              {subject}
            </p>
            <h3 className="font-semibold text-xl leading-relaxed text-[var(--color-text-primary)]">
              {unit}
            </h3>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
            <div className="bg-[var(--color-background)] rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-sm text-[var(--color-text-secondary)] mb-1">
                <Calendar className="h-4 w-4" />
                <span>Inicio</span>
              </div>
              <p className="font-semibold text-base text-[var(--color-text-primary)]">
                {formatDateTime(fecha_inicio)}
              </p>
            </div>

            <div className="bg-[var(--color-background)] rounded-lg p-4 text-center border-l border-[var(--color-border)] border-r border-[var(--color-border)]">
              <div className="flex items-center justify-center gap-1.5 text-sm text-[var(--color-text-secondary)] mb-1">
                <Clock className="h-4 w-4" />
                <span>Duración</span>
              </div>
              <p className="font-semibold text-base text-[var(--color-text-primary)]">
                {tiempo_examen} min
              </p>
            </div>

            <div className="bg-[var(--color-background)] rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-sm text-[var(--color-text-secondary)] mb-1">
                <ClockIcon className="h-4 w-4" />
                <span>Fin</span>
              </div>
              <p className="font-semibold text-base text-[var(--color-text-primary)]">
                {formatTime(fecha_fin)}
              </p>
            </div>
          </div>

          {/* Optional: Question count */}
          {questionCount && (
            <p className="text-sm text-[var(--color-text-secondary)] text-center pt-2 border-t border-[var(--color-border)]">
              {questionCount} preguntas
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={onEnter}
              className="flex-1 bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity py-3 font-medium"
              size="lg"
            >
              Entrar a evaluación
            </Button>
            {onViewDetails && (
              <Button
                onClick={onViewDetails}
                variant="ghost"
                className="flex-1 sm:w-auto text-[var(--color-text-primary)] hover:bg-[var(--color-background)] py-3 font-medium"
                size="lg"
              >
                Ver detalles
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}