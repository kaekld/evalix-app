"use client";

import { useState, useEffect, useCallback } from "react";
import { useExamContext } from "./ExamRendirClient";
import { useTelemetryContext } from "./TelemetryProvider";
import type { Pregunta, Intento } from "./types";

interface TextareaQuestionProps {
  pregunta: Pregunta;
  respuestaActual: string;
}

export function TextareaQuestion({ pregunta, respuestaActual }: TextareaQuestionProps) {
  const { setIntento, intento } = useExamContext();
  const { monacoHandlers } = useTelemetryContext();
  const [localValue, setLocalValue] = useState(respuestaActual);
  const [tiempoSegundos, setTiempoSegundos] = useState(0);

  useEffect(() => {
    setLocalValue(respuestaActual);
  }, [respuestaActual]);

  useEffect(() => {
    const interval = setInterval(() => setTiempoSegundos((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setLocalValue(value);
    },
    []
  );

  const handleBlur = useCallback(() => {
    const newRespuestas = { ...intento.respuestas };
    newRespuestas[pregunta.id] = {
      respuesta: localValue,
      tiempo_segundos: tiempoSegundos,
      eventos: [],
      respondida_en: new Date().toISOString(),
    };
    setIntento((prev: Intento) => ({ ...prev, respuestas: newRespuestas }));
  }, [pregunta.id, localValue, tiempoSegundos, setIntento, intento]);

  return (
    <div className="space-y-3">
      <textarea
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Escribe tu respuesta aquí..."
        className="w-full min-h-[150px] p-4 border border-[var(--color-border)] rounded-lg bg-white text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-y font-sans"
        rows={8}
      />
      <p className="font-normal text-xs text-[var(--color-text-muted)] text-right">
        Tiempo en esta pregunta: {Math.floor(tiempoSegundos / 60)}:{String(tiempoSegundos % 60).padStart(2, "0")}
      </p>
    </div>
  );
}