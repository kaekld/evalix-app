"use client";

import { RadioQuestion } from "./RadioQuestion";
import { TextareaQuestion } from "./TextareaQuestion";
import { MonacoEditorQuestion } from "./MonacoEditorQuestion";
import type { Pregunta } from "./types";

interface QuestionRendererProps {
  pregunta: Pregunta;
  respuestaActual: string;
}

export function QuestionRenderer({ pregunta, respuestaActual }: QuestionRendererProps) {
  switch (pregunta.tipo) {
    case "cerrada":
      return <RadioQuestion pregunta={pregunta} respuestaActual={respuestaActual} />;
    case "abierta_texto":
      return <TextareaQuestion pregunta={pregunta} respuestaActual={respuestaActual} />;
    case "abierta_codigo":
      return <MonacoEditorQuestion pregunta={pregunta} respuestaActual={respuestaActual} />;
    default:
      return (
        <div className="text-[var(--color-danger)] text-sm">
          Tipo de pregunta no soportado: {(pregunta as any).tipo}
        </div>
      );
  }
}