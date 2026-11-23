"use client";

import { Pregunta } from "./types";
import { Edit, Trash2, GripVertical, Image, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui";

interface PreguntaCardProps {
  pregunta: Pregunta;
  index: number;
  onEdit: (pregunta: Pregunta) => void;
  onDelete: (id: string) => void;
  onReorder?: (id: string, direction: "up" | "down") => void;
}

export default function PreguntaCard({
  pregunta,
  index,
  onEdit,
  onDelete,
  onReorder,
}: PreguntaCardProps) {
  return (
    <div className="bg-white border border-[#dedee8] rounded-xl p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        {/* Drag handle + number */}
        <div className="flex flex-col items-center text-[#747487]">
          <span className="font-mono text-lg font-semibold">{index + 1}</span>
          {onReorder && (
            <button
              onClick={() => onReorder(pregunta.id, "up")}
              disabled={index === 0}
              className="p-1 text-[#747487] hover:text-[#232334] hover:bg-[#f6f6fa] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              aria-label="Mover arriba"
            >
              <GripVertical className="h-4 w-4 rotate-90" />
            </button>
          )}
        </div>

        {/* Question content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f0eafb] text-[#6543ab]">
              Cerrada
            </span>
            {pregunta.imagenUrl && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#e0f2fe] text-[#0369a1]">
                {/* eslint-disable-next-line jsx-a11y/alt-text -- Lucide icon, not an image */}
                <Image className="h-3 w-3 mr-1" aria-hidden="true" /> Imagen
              </span>
            )}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f6f6fa] text-[#747487]">
              <Clock className="h-3 w-3 mr-1" /> {pregunta.tiempoSegundos}s
            </span>
          </div>

          <p className="font-medium text-base text-[#232334] mb-2">{pregunta.enunciado}</p>

          {pregunta.opciones && pregunta.opciones.length > 0 && (
            <div className="space-y-1.5 ml-2 border-l-2 border-[#dedee8] pl-3">
              {pregunta.opciones.map((opcion, i) => (
                <div
                  key={opcion.id || i}
                  className={`flex items-center gap-2 text-sm ${
                    opcion.esCorrecta ? "text-[#336647]" : "text-[#747487]"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      opcion.esCorrecta
                        ? "border-[#336647] bg-[#336647]"
                        : "border-[#dedee8]"
                    }`}
                  >
                    {opcion.esCorrecta && <Check className="h-3 w-3 text-white" />}
                  </span>
                  <span className={`truncate ${opcion.esCorrecta ? "font-medium" : ""}`}>
                    {opcion.texto}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(pregunta)}
            className="text-[#6543ab] hover:text-[#533a92] hover:bg-[#f0eafb]"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(pregunta.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}