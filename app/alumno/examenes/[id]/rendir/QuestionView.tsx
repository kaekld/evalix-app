"use client";

import { useExamContext } from "./ExamRendirClient";
import { QuestionRenderer } from "./QuestionRenderer";

export function QuestionView() {
  const { preguntas, currentIndex, intento } = useExamContext();
  const pregunta = preguntas[currentIndex];

  if (!pregunta) {
    return (
      <div className="bg-white border border-[var(--color-border)] rounded-xl p-8 text-center">
        <p className="text-[var(--color-text-secondary)]">No hay preguntas disponibles</p>
      </div>
    );
  }

  const respuestaGuardada = intento.respuestas[pregunta.id];
  const yaRespondida = respuestaGuardada?.respuesta && respuestaGuardada.respuesta.trim() !== "";

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
      {pregunta.imagen_url && (
        <div className="relative aspect-video bg-[var(--color-background)]">
          <img
            src={pregunta.imagen_url}
            alt={`Imagen de la pregunta ${pregunta.orden + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-lg text-[var(--color-text-primary)]">
              Pregunta {pregunta.orden + 1} de {preguntas.length}
            </p>
            <p className="font-normal text-sm text-[var(--color-text-secondary)] mt-1">
              Tiempo sugerido: {Math.floor(pregunta.tiempo_segundos / 60)}:{String(pregunta.tiempo_segundos % 60).padStart(2, "0")}
            </p>
          </div>
          {yaRespondida && (
            <span className="flex-shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-success-bg)] text-[var(--color-success)]">
              Respondida
            </span>
          )}
        </div>

        <div className="prose prose-[var(--color-text-primary)] max-w-none">
          <p className="whitespace-pre-wrap">{pregunta.enunciado}</p>
        </div>

        <QuestionRenderer pregunta={pregunta} respuestaActual={respuestaGuardada?.respuesta || ""} />
      </div>
    </div>
  );
}