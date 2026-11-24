"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowLeft } from "lucide-react";
import EvaluacionHeader from "@/app/docente/components/evaluaciones/EvaluacionHeader";
import EvaluacionSection from "@/app/docente/components/evaluaciones/EvaluacionSection";
import CrearEvaluacionModal from "@/app/docente/components/modals/CrearEvaluacionModal";
import { Evaluacion, Grupo } from "@/app/docente/components/evaluaciones/types";

interface ApiEvaluacion {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  estado: "pendiente" | "publicada" | "finalizada";
  tiempo_por_pregunta: number;
  orden_aleatorio: boolean;
  creado_en: string;
  actualizado_en: string;
  grupo_id: string;
  grupoNombre: string;
  grupoCodigo: string;
  preguntas: Array<{
    id: string;
    tipo: string;
    enunciado: string;
    imagen_url: string | null;
    tiempo_segundos: number;
    orden: number;
    opciones: Array<{ id: string; texto: string; es_correcta: boolean; orden: number }>;
  }>;
}

interface GrupoEvaluacionesClientProps {
  grupo: Grupo & { evaluaciones_count?: number };
  initialEvaluaciones: ApiEvaluacion[];
}

export default function GrupoEvaluacionesClient({ grupo, initialEvaluaciones }: GrupoEvaluacionesClientProps) {
  const router = useRouter();
  const [showCrearEvaluacionModal, setShowCrearEvaluacionModal] = useState(false);
  const [evaluaciones, setEvaluaciones] = useState<ApiEvaluacion[]>(initialEvaluaciones);

  const transformEvaluacion = (e: ApiEvaluacion): Evaluacion => ({
    id: e.id,
    titulo: e.titulo,
    fecha: e.fecha_inicio ? new Date(e.fecha_inicio).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }) : "",
    hora: e.fecha_inicio ? new Date(e.fecha_inicio).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "",
    status: e.estado,
    grupoId: e.grupo_id,
    grupoNombre: e.grupoNombre,
    tiempoExamen: e.tiempo_por_pregunta,
  });

  const pendientesEvaluaciones = evaluaciones.filter((e) => e.estado === "pendiente").map(transformEvaluacion);
  const publicadasEvaluaciones = evaluaciones.filter((e) => e.estado === "publicada").map(transformEvaluacion);
  const finalizadasEvaluaciones = evaluaciones.filter((e) => e.estado === "finalizada").map(transformEvaluacion);

  const handleCreateEvaluacion = async (data: { titulo: string; grupoId: string; fecha: string; hora: string; descripcion?: string }) => {
    try {
      const fechaInicio = `${data.fecha}T${data.hora}:00`;
      const fechaFin = new Date(fechaInicio);
      fechaFin.setHours(fechaFin.getHours() + 2);

      const requestBody = {
        titulo: data.titulo,
        grupo_id: data.grupoId,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin.toISOString(),
        descripcion: data.descripcion,
      };

      const res = await fetch("/api/docente/evaluaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const responseData = await res.json();

      if (res.ok) {
        setShowCrearEvaluacionModal(false);
        // Refresh by re-fetching
        const refreshRes = await fetch(`/api/docente/evaluaciones?grupo_id=${grupo.id}`);
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setEvaluaciones(data);
        }
      } else {
        throw new Error(responseData.message || "Error al crear evaluación");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al crear evaluación";
      alert(message);
    }
  };

  const handleBack = () => {
    router.back();
  };

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
          <p className="text-sm text-zinc-500">Grupo / {grupo.nombre}</p>
          <h1 className="font-semibold text-2xl leading-relaxed text-[#232334] tracking-tight">
            Evaluaciones
          </h1>
        </div>
        <button
          onClick={() => setShowCrearEvaluacionModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#6543ab] text-white font-medium text-sm rounded-lg hover:bg-[#533a92] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Crear evaluación
        </button>
      </div>

      {/* Header with counts */}
      <EvaluacionHeader
        grupoNombre={grupo.nombre}
        pendientesCount={pendientesEvaluaciones.length}
        publicadasCount={publicadasEvaluaciones.length}
        finalizadasCount={finalizadasEvaluaciones.length}
      />

      {/* Evaluations Sections */}
      <div className="space-y-6">
        <EvaluacionSection
          title="Evaluaciones pendientes"
          evaluaciones={pendientesEvaluaciones}
          emptyMessage="No hay evaluaciones pendientes."
        />
        <EvaluacionSection
          title="Evaluaciones publicadas"
          evaluaciones={publicadasEvaluaciones}
          emptyMessage="No hay evaluaciones publicadas."
        />
        <EvaluacionSection
          title="Evaluaciones finalizadas"
          evaluaciones={finalizadasEvaluaciones}
          emptyMessage="No hay evaluaciones finalizadas."
        />
      </div>

      {/* Modals */}
      <CrearEvaluacionModal
        isOpen={showCrearEvaluacionModal}
        onClose={() => setShowCrearEvaluacionModal(false)}
        onCreate={handleCreateEvaluacion}
        grupos={[{ id: grupo.id, nombre: grupo.nombre, codigo: grupo.codigo }]}
      />
    </div>
  );
}