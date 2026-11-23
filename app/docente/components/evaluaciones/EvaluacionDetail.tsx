"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { Evaluacion, Grupo, Pregunta, Opcion } from "./types";
import ConfiguracionTab from "./ConfiguracionTab";
import ExamenTab from "./ExamenTab";
import StatusBadge from "./StatusBadge";

interface EvaluacionDetailProps {
  initialEvaluacion: Evaluacion;
  grupos: Grupo[];
}

export default function EvaluacionDetail({ initialEvaluacion, grupos }: EvaluacionDetailProps) {
  const router = useRouter();
  const [evaluacion, setEvaluacion] = useState<Evaluacion>(initialEvaluacion);
  const [activeTab, setActiveTab] = useState<"configuracion" | "examen" | "resultados">("configuracion");
  const [isSaving, setIsSaving] = useState(false);

  const apiBase = `/api/docente/evaluaciones/${evaluacion.id}`;

  const handleSaveConfig = useCallback(
    async (data: Partial<Evaluacion>) => {
      setIsSaving(true);
      try {
        const res = await fetch(apiBase, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Error al guardar");
        }
        const updated = await res.json();
        setEvaluacion((prev) => ({ ...prev, ...updated }));
      } catch {
        throw new Error("Error al guardar");
      } finally {
        setIsSaving(false);
      }
    },
    [apiBase]
  );

  const handleAddPregunta = useCallback(
    async (pregunta: Omit<Pregunta, "id" | "evaluacionId"> & { opciones: Omit<Opcion, "id" | "preguntaId">[] }) => {
      setIsSaving(true);
      try {
        const res = await fetch(`${apiBase}/preguntas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pregunta),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Error al crear pregunta");
        }
        const newPregunta = await res.json();
        setEvaluacion((prev) => ({
          ...prev,
          preguntas: [...(prev.preguntas || []), newPregunta],
        }));
      } catch {
        throw new Error("Error al crear pregunta");
      } finally {
        setIsSaving(false);
      }
    },
    [apiBase]
  );

  const handleUpdatePregunta = useCallback(
    async (pregunta: Pregunta) => {
      setIsSaving(true);
      try {
        const res = await fetch(`${apiBase}/preguntas/${pregunta.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pregunta),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Error al actualizar pregunta");
        }
        const updated = await res.json();
        setEvaluacion((prev) => ({
          ...prev,
          preguntas: prev.preguntas?.map((p) => (p.id === pregunta.id ? updated : p)) || [],
        }));
      } catch {
        throw new Error("Error al actualizar pregunta");
      } finally {
        setIsSaving(false);
      }
    },
    [apiBase]
  );

  const handleDeletePregunta = useCallback(
    async (id: string) => {
      setIsSaving(true);
      try {
        const res = await fetch(`${apiBase}/preguntas/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Error al eliminar pregunta");
        }
        setEvaluacion((prev) => ({
          ...prev,
          preguntas: prev.preguntas?.filter((p) => p.id !== id) || [],
        }));
      } catch {
        throw new Error("Error al eliminar pregunta");
      } finally {
        setIsSaving(false);
      }
    },
    [apiBase]
  );

  const handleReorderPregunta = useCallback(
    (id: string, direction: "up" | "down") => {
      setEvaluacion((prev) => {
        const preguntas = [...(prev.preguntas || [])];
        const index = preguntas.findIndex((p) => p.id === id);
        if (index === -1) return prev;

        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= preguntas.length) return prev;

        [preguntas[index], preguntas[newIndex]] = [preguntas[newIndex], preguntas[index]];
        // Update orden values
        preguntas.forEach((p, i) => {
          if (p.orden !== i) p.orden = i;
        });
        return { ...prev, preguntas };
      });
    },
    []
  );

  const handleBack = () => {
    router.back();
  };

  const handlePublish = useCallback(async () => {
    if (confirm("¿Publicar esta evaluación? Los alumnos podrán verla y responderla en el horario indicado.")) {
      await handleSaveConfig({ status: "publicada" });
    }
  }, [handleSaveConfig]);

  const handleFinalize = useCallback(async () => {
    if (confirm("¿Finalizar esta evaluación? Ya no se podrán enviar respuestas.")) {
      await handleSaveConfig({ status: "finalizada" });
    }
  }, [handleSaveConfig]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handleBack}
          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-700 hover:bg-white transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <p className="text-sm text-zinc-500">Evaluación</p>
          <h1 className="font-semibold text-2xl leading-relaxed text-[#232334] tracking-tight">
            {evaluacion.titulo}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={evaluacion.status} size="lg" />
          {evaluacion.status === "pendiente" && (
            <Button variant="primary" onClick={handlePublish} disabled={isSaving} icon={<Save className="h-4 w-4" />}>
              Publicar
            </Button>
          )}
          {evaluacion.status === "publicada" && (
            <Button variant="danger" onClick={handleFinalize} disabled={isSaving} icon={<AlertCircle className="h-4 w-4" />}>
              Finalizar
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-[#dedee8] rounded-xl overflow-hidden">
        <nav className="flex border-b border-[#dedee8] px-4" aria-label="Pestañas de evaluación">
          {(
            [
              { id: "configuracion", label: "Configuración", icon: <Save className="h-4 w-4" /> },
              { id: "examen", label: "Examen", icon: <AlertCircle className="h-4 w-4" /> },
              { id: "resultados", label: "Resultados", icon: <AlertCircle className="h-4 w-4" /> },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-[#6543ab] text-[#6543ab]"
                  : "border-transparent text-[#747487] hover:text-[#232334] hover:bg-[#f6f6fa]"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-6">
          {activeTab === "configuracion" && (
            <ConfiguracionTab
              evaluacion={evaluacion}
              grupos={grupos}
              onSave={handleSaveConfig}
              isLoading={isSaving}
            />
          )}

          {activeTab === "examen" && (
            <ExamenTab
              preguntas={evaluacion.preguntas || []}
              onAddPregunta={handleAddPregunta}
              onUpdatePregunta={handleUpdatePregunta}
              onDeletePregunta={handleDeletePregunta}
              onReorderPregunta={handleReorderPregunta}
              isLoading={isSaving}
            />
          )}

          {activeTab === "resultados" && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-[#dedee8] mx-auto mb-4" />
              <h3 className="font-semibold text-lg text-[#232334] mb-2">Resultados</h3>
              <p className="text-[#747487]">Próximamente: lista de entregas, calificación automática y revisión manual.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}