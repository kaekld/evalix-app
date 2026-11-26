"use client";

import { useExamContext } from "./ExamRendirClient";

export function NavigationBar() {
  const { preguntas, currentIndex, setCurrentIndex, intento, isFinalizing } = useExamContext();

  const handleNext = () => {
    if (currentIndex < preguntas.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const getQuestionStatus = (idx: number) => {
    const respuesta = intento.respuestas[preguntas[idx]?.id];
    if (!respuesta) return "pending";
    if (respuesta.respuesta && respuesta.respuesta.trim() !== "") return "answered";
    return "visited";
  };

  return (
    <nav className="bg-white border border-[var(--color-border)] rounded-xl p-4 mt-6 sticky bottom-4 z-10" aria-label="Navegación de preguntas">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-[var(--color-text-secondary)]">Preguntas:</span>
          <div className="flex items-center gap-1 flex-wrap" role="group" aria-label="Números de pregunta">
            {preguntas.map((_, idx) => {
              const status = getQuestionStatus(idx);
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  disabled={idx > currentIndex}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    idx === currentIndex
                      ? "bg-[var(--color-primary)] text-white shadow"
                      : status === "answered"
                      ? "bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success)]"
                      : status === "visited"
                      ? "bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning)]"
                      : "bg-[var(--color-background)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
                  }`}
                  aria-label={`Pregunta ${idx + 1}${status === "answered" ? " (respondida)" : status === "visited" ? " (visitada)" : ""}`}
                  aria-current={idx === currentIndex ? "true" : "false"}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0 || isFinalizing}
            className="px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg font-medium hover:bg-[var(--color-background)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === preguntas.length - 1 || isFinalizing}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            Siguiente
          </button>
        </div>
      </div>
    </nav>
  );
}