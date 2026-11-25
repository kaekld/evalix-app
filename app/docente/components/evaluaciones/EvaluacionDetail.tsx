"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { Evaluacion, Grupo, Pregunta, Opcion } from "./types";
import ConfiguracionTab from "./ConfiguracionTab";
import ExamenTab from "./ExamenTab";
import StatusBadge from "./StatusBadge";
import ConfirmActionModal from "@/app/docente/components/modals/ConfirmActionModal";
import ConfirmDeleteModal from "@/app/docente/components/modals/ConfirmDeleteModal";

interface EvaluacionDetailProps {
  initialEvaluacion: Evaluacion;
  grupos: Grupo[];
}

export default function EvaluacionDetail({ initialEvaluacion, grupos }: EvaluacionDetailProps) {
  const router = useRouter();
  const [evaluacion, setEvaluacion] = useState<Evaluacion>(initialEvaluacion);
  const [activeTab, setActiveTab] = useState<"configuracion" | "examen" | "resultados">("configuracion");
  const [isSaving, setIsSaving] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const apiBase = `/api/docente/evaluaciones/${evaluacion.id}`;

  const handleDelete = useCallback(async () => {
    setIsSaving(true);
    try {
      const res = await fetch(apiBase, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al eliminar");
      }
      router.back();
    } catch {
      throw new Error("Error al eliminar");
    } finally {
      setIsSaving(false);
    }
  }, [apiBase, router]);

  const handleSaveConfig = useCallback(
    async (data: {
      titulo?: string;
      grupo_id?: string;
      fecha_inicio?: string;
      fecha_fin?: string;
      estado?: "pendiente" | "publicada" | "finalizada";
      descripcion?: string;
      tiempo_examen?: number;
      orden_aleatorio?: boolean;
    }) => {
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
        // Map snake_case API response to camelCase frontend type
        // fecha must be ISO format (YYYY-MM-DD) for <input type="date">
        const fechaISO = updated.fecha_inicio ? updated.fecha_inicio.split("T")[0] : "";
        const mapped = {
          ...updated,
          status: updated.estado,
          tiempoExamen: updated.tiempo_examen,
          ordenAleatorio: updated.orden_aleatorio,
          fecha: fechaISO,
          hora: updated.fecha_inicio ? new Date(updated.fecha_inicio).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "",
        };
        setEvaluacion((prev) => ({ ...prev, ...mapped }));
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

  const handlePublish = useCallback(() => {
    setShowPublishModal(true);
  }, []);

  const handleConfirmPublish = useCallback(async () => {
    await handleSaveConfig({ estado: "publicada" });
    setShowPublishModal(false);
  }, [handleSaveConfig]);

  const handleFinalize = useCallback(() => {
    setShowFinalizeModal(true);
  }, []);

  const handleConfirmFinalize = useCallback(async () => {
    await handleSaveConfig({ estado: "finalizada" });
    setShowFinalizeModal(false);
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
          <Button variant="ghost" onClick={() => setShowDeleteModal(true)} disabled={isSaving} icon={<Trash2 className="h-4 w-4" />} aria-label="Eliminar evaluación" />
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

      {/* Confirmation Modals */}
      <ConfirmActionModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onConfirm={handleConfirmPublish}
        title="Publicar evaluación"
        message="¿Estás seguro de que quieres publicar esta evaluación? Los alumnos podrán verla y responderla en el horario indicado (desde la fecha y hora de inicio hasta la fecha y hora de fin)."
        confirmText="Publicar"
        variant="info"
        isLoading={isSaving}
      />
      <ConfirmActionModal
        isOpen={showFinalizeModal}
        onClose={() => setShowFinalizeModal(false)}
        onConfirm={handleConfirmFinalize}
        title="Finalizar evaluación"
        message="¿Estás seguro de que quieres finalizar esta evaluación? Una vez finalizada, ya no se podrán enviar respuestas y los alumnos no podrán acceder al examen. Esta acción no se puede deshacer."
        confirmText="Finalizar"
        variant="danger"
        isLoading={isSaving}
      />
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar evaluación"
        message="¿Estás seguro de que quieres eliminar esta evaluación? Se borrará permanentemente junto con todas sus preguntas y respuestas. Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
}