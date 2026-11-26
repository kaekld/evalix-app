"use client";

import { useExamContext } from "./ExamRendirClient";

export function ExamHeader() {
  const { evaluacion, tiempoRestante, currentIndex, preguntas, isFinalizing, finalizarExamen } = useExamContext();

  const formatTime = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isWarning = tiempoRestante <= 60 * 5; // 5 minutos
  const isDanger = tiempoRestante <= 60; // 1 minuto

  return (
    <header className="bg-white border border-[var(--color-border)] rounded-xl p-4 mb-6 sticky top-4 z-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-xl text-[var(--color-text-primary)] truncate">
            {evaluacion.titulo}
          </h1>
          <p className="font-normal text-sm text-[var(--color-text-secondary)] mt-1">
            {evaluacion.grupo_nombre} · {preguntas.length} preguntas
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold ${
              isDanger
                ? "bg-[var(--color-danger-bg)] text-[var(--color-danger)] animate-pulse"
                : isWarning
                ? "bg-[var(--color-warning-bg)] text-[var(--color-warning)]"
                : "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
            }`}
            aria-live="polite"
            aria-label={`Tiempo restante: ${formatTime(tiempoRestante)}`}
          >
            {formatTime(Math.max(0, tiempoRestante))}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            Pregunta <span className="font-medium">{currentIndex + 1}</span> de {preguntas.length}
          </div>

          <button
            onClick={finalizarExamen}
            disabled={isFinalizing}
            className="px-4 py-2 bg-[var(--color-danger)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isFinalizing ? "Finalizando..." : "Finalizar evaluación"}
          </button>
        </div>
      </div>

      <div className="mt-4 h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isDanger ? "bg-[var(--color-danger)]" : isWarning ? "bg-[var(--color-warning)]" : "bg-[var(--color-primary)]"
          }`}
          style={{ width: `${Math.max(0, (tiempoRestante / (evaluacion.tiempo_examen * 60)) * 100)}%` }}
        />
      </div>
    </header>
  );
}