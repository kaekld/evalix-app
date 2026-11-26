"use client";

import { useExamContext } from "./ExamRendirClient";
import { useTelemetryContext } from "./TelemetryProvider";
import type { Pregunta, Intento } from "./types";

interface RadioQuestionProps {
  pregunta: Pregunta;
  respuestaActual: string;
}

export function RadioQuestion({ pregunta, respuestaActual }: RadioQuestionProps) {
  const { setIntento, intento } = useExamContext();
  const { monacoHandlers } = useTelemetryContext();

  const handleChange = (opcionId: string) => {
    const newRespuestas = { ...intento.respuestas };
    newRespuestas[pregunta.id] = {
      respuesta: opcionId,
      tiempo_segundos: 0,
      eventos: [],
      respondida_en: new Date().toISOString(),
    };
    setIntento((prev: Intento) => ({ ...prev, respuestas: newRespuestas }));
  };

  return (
    <div className="space-y-3">
      {pregunta.opciones
        .sort((a: { orden: number }, b: { orden: number }) => a.orden - b.orden)
        .map((opcion) => (
          <label
            key={opcion.id}
            className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
              respuestaActual === opcion.id
                ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                : "border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-background)]"
            }`}
          >
            <input
              type="radio"
              name={`pregunta-${pregunta.id}`}
              value={opcion.id}
              checked={respuestaActual === opcion.id}
              onChange={() => handleChange(opcion.id)}
              className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-[var(--color-border)]"
            />
            <span className="font-normal text-base text-[var(--color-text-primary)] flex-1">
              {opcion.texto}
            </span>
          </label>
        ))}
    </div>
  );
}