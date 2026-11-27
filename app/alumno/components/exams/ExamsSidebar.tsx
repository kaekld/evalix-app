"use client";

import { Calendar, Clock, AlertCircle, BookOpen } from "lucide-react";
import { type Exam } from "@/components/ui";

interface ExamsSidebarProps {
  exams: Exam[];
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function getDaysUntil(iso: string) {
  const now = new Date();
  const target = new Date(iso);
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function getStatusInfo(exam: Exam) {
  const daysUntil = getDaysUntil(exam.fecha_inicio_iso || exam.date);
  
  if (daysUntil < 0 && exam.status !== "completed") {
    return { label: "En curso", className: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]", icon: AlertCircle };
  }
  if (daysUntil === 0) {
    return { label: "Hoy", className: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]", icon: AlertCircle };
  }
  if (daysUntil === 1) {
    return { label: "Mañana", className: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]", icon: Clock };
  }
  if (daysUntil <= 3) {
    return { label: `${daysUntil} días`, className: "bg-[var(--color-primary-light)] text-[var(--color-primary)]", icon: Calendar };
  }
  return { label: `${daysUntil} días`, className: "bg-[var(--color-background)] text-[var(--color-text-secondary)] border border-[var(--color-border)]", icon: Calendar };
}

export default function ExamsSidebar({ exams }: ExamsSidebarProps) {
  const upcomingExams = exams
    .filter(e => e.status === "upcoming" || e.status === "pending")
    .sort((a, b) => new Date(a.fecha_inicio_iso || a.date).getTime() - new Date(b.fecha_inicio_iso || b.date).getTime());

  if (upcomingExams.length === 0) {
    return (
      <aside className="w-64 flex-shrink-0">
        <div className="bg-white border border-[var(--color-border)] rounded-xl h-[26.5rem] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h2 className="font-semibold text-sm leading-relaxed text-[var(--color-text-primary)]">
              Evaluaciones próximas
            </h2>
            <BookOpen className="h-5 w-5 text-[var(--color-text-muted)]" />
          </div>
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <BookOpen className="h-12 w-12 text-[var(--color-border)] mb-4" />
            <p className="font-medium text-[var(--color-text-secondary)] mb-1">No hay evaluaciones próximas</p>
            <p className="text-xs text-[var(--color-text-muted)]">Cuando se programen, aparecerán aquí</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 flex-shrink-0">
      <div className="bg-white border border-[var(--color-border)] rounded-xl h-[26.5rem] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-background)]">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-[var(--color-text-primary)]">
              Evaluaciones próximas
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              {upcomingExams.length}
            </span>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {upcomingExams.map((exam) => {
            const status = getStatusInfo(exam);
            const StatusIcon = status.icon;

            return (
              <div
                key={exam.id}
                className="rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary-light)]/5 transition-all duration-200"
              >
                <div className="p-3 flex items-start gap-3">
                  {/* Date pillar */}
                  <div className="flex-shrink-0 w-14 text-center">
                    <div className={`${status.className} rounded-lg px-2 py-1.5`}>
                      <p className="font-bold text-sm text-[var(--color-text-primary)]">
                        {new Date(exam.fecha_inicio_iso || exam.date).getDate()}
                      </p>
                      <p className="font-medium text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">
                        {new Date(exam.fecha_inicio_iso || exam.date).toLocaleDateString("es-ES", { month: "short" })}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mt-1.5 ${status.className}`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                  </div>

                  {/* Exam info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[var(--color-text-primary)] truncate pr-2">
                      {exam.unit}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-secondary)]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {exam.time || (exam.fecha_inicio_iso ? formatTime(exam.fecha_inicio_iso) : "")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-[var(--color-border)] bg-[var(--color-background)]">
          <p className="text-xs text-[var(--color-text-muted)] text-center">
            {upcomingExams.length} evaluación{upcomingExams.length !== 1 ? "es" : ""} programada{upcomingExams.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </aside>
  );
}