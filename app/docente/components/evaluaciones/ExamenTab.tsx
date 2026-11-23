"use client";

import { useState, useCallback } from "react";
import { Pregunta, Opcion } from "./types";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui";
import PreguntaCard from "./PreguntaCard";
import PreguntaForm from "./PreguntaForm";

type OpcionInput = Omit<Opcion, "id" | "preguntaId">;
type PreguntaInput = Omit<Pregunta, "id" | "evaluacionId"> & { opciones: OpcionInput[] };

interface ExamenTabProps {
  preguntas: Pregunta[];
  onAddPregunta: (pregunta: PreguntaInput) => void;
  onUpdatePregunta: (pregunta: Pregunta) => void;
  onDeletePregunta: (id: string) => void;
  onReorderPregunta: (id: string, direction: "up" | "down") => void;
  isLoading?: boolean;
}

export default function ExamenTab({
  preguntas,
  onAddPregunta,
  onUpdatePregunta,
  onDeletePregunta,
  onReorderPregunta,
  isLoading = false,
}: ExamenTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingPregunta, setEditingPregunta] = useState<Pregunta | null>(null);

  const handleAddPregunta = useCallback(
    async (pregunta: PreguntaInput) => {
      await onAddPregunta(pregunta);
      setShowForm(false);
      setEditingPregunta(null);
    },
    [onAddPregunta]
  );

  const handleUpdatePregunta = useCallback(
    async (pregunta: Pregunta) => {
      await onUpdatePregunta(pregunta);
      setShowForm(false);
      setEditingPregunta(null);
    },
    [onUpdatePregunta]
  );

  const handleOpenAdd = useCallback(() => {
    setEditingPregunta(null);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((pregunta: Pregunta) => {
    setEditingPregunta(pregunta);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      if (confirm("¿Eliminar esta pregunta? Esta acción no se puede deshacer.")) {
        onDeletePregunta(id);
      }
    },
    [onDeletePregunta]
  );

  const handleReorder = useCallback(
    (id: string, direction: "up" | "down") => {
      onReorderPregunta(id, direction);
    },
    [onReorderPregunta]
  );

  return (
    <div className="space-y-6">
      {/* Header with add button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg text-[#232334]">Preguntas del examen</h3>
          <p className="text-sm text-[#747487] mt-1">
            {preguntas.length} pregunta{preguntas.length !== 1 ? "s" : ""} configurada{preguntas.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={handleOpenAdd} disabled={isLoading} icon={<Plus className="h-4 w-4" />}>
          Añadir pregunta
        </Button>
      </div>

      {/* Questions list */}
      {preguntas.length === 0 ? (
        <div className="bg-white border border-[#dedee8] rounded-xl p-8 text-center">
          <p className="font-normal text-sm text-[#747487] mb-4">
            No hay preguntas configuradas. Añade la primera pregunta para comenzar.
          </p>
          <Button onClick={handleOpenAdd} disabled={isLoading} icon={<Plus className="h-4 w-4" />}>
            Crear primera pregunta
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {preguntas.map((pregunta, index) => (
            <PreguntaCard
              key={pregunta.id}
              pregunta={pregunta}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReorder={handleReorder}
            />
          ))}
        </div>
      )}

      {/* Pregunta Form Modal */}
      <PreguntaForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingPregunta(null);
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSave={(editingPregunta ? handleUpdatePregunta : handleAddPregunta) as any}
        initialData={editingPregunta}
        isLoading={isLoading}
      />
    </div>
  );
}