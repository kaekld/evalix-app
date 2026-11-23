"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BaseHeader } from "@/components/ui";
import { Plus } from "lucide-react";
import GrupoSelector from "../components/evaluaciones/GrupoSelector";
import EvaluacionHeader from "../components/evaluaciones/EvaluacionHeader";
import EvaluacionSection from "../components/evaluaciones/EvaluacionSection";
import CrearEvaluacionModal from "../components/modals/CrearEvaluacionModal";
import { useGrupos } from "@/lib/hooks/useGrupos";
import {
  Evaluacion,
  Grupo,
} from "../components/evaluaciones/types";

interface User {
  id: string;
  nombre_completo: string;
  correo: string;
  institucion: string | null;
  institucion_id: string | null;
  rol: string;
}

interface ApiEvaluacion {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  estado: "pendiente" | "publicada" | "finalizada";
  tiempo_examen: number;
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

const navigationLinks = [
  { href: "/docente/grupos", label: "Grupos" },
  { href: "/docente/evaluaciones", label: "Evaluaciones", active: true },
  { href: "/docente/estudiantes", label: "Estudiantes" },
];

export default function DocenteEvaluacionesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [selectedGrupoId, setSelectedGrupoId] = useState<string | null>("all");
  const [showCrearEvaluacionModal, setShowCrearEvaluacionModal] = useState(false);
  const [evaluaciones, setEvaluaciones] = useState<ApiEvaluacion[]>([]);
  const [evaluacionesLoading, setEvaluacionesLoading] = useState(true);
  const [evaluacionesError, setEvaluacionesError] = useState<string | null>(null);
  const router = useRouter();

  const {
    grupos,
    error: gruposError,
    fetchGrupos,
  } = useGrupos();

  // Convert grupos to the format needed for GrupoSelector
  const gruposForSelector: Grupo[] = grupos.map((g) => ({
    id: g.id,
    nombre: g.nombre,
    codigo: g.codigo,
  })) as Grupo[];

  // Transform API data to UI format
  const transformEvaluacion = (e: ApiEvaluacion): Evaluacion => ({
    id: e.id,
    titulo: e.titulo,
    fecha: e.fecha_inicio ? new Date(e.fecha_inicio).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }) : "",
    hora: e.fecha_inicio ? new Date(e.fecha_inicio).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "",
    status: e.estado,
    grupoId: e.grupo_id,
    grupoNombre: e.grupoNombre,
    tiempoExamen: e.tiempo_examen,
  });

  // Filter evaluations by selected group
  const filteredEvaluaciones = selectedGrupoId === "all" || selectedGrupoId === null
    ? evaluaciones
    : evaluaciones.filter((e) => e.grupo_id === selectedGrupoId);

  const pendientesEvaluaciones = filteredEvaluaciones.filter((e) => e.estado === "pendiente").map(transformEvaluacion);
  const publicadasEvaluaciones = filteredEvaluaciones.filter((e) => e.estado === "publicada").map(transformEvaluacion);
  const finalizadasEvaluaciones = filteredEvaluaciones.filter((e) => e.estado === "finalizada").map(transformEvaluacion);

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser({
            id: data.id,
            nombre_completo: data.nombre_completo || data.email,
            correo: data.email,
            institucion: data.institucion ?? null,
            institucion_id: data.institucion_id ?? null,
            rol: data.rol,
          });
        }
      } catch {
        // Usuario no autenticado, el middleware redirigirá
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Fetch grupos
  useEffect(() => {
    fetchGrupos();
  }, [fetchGrupos]);

  // Fetch evaluaciones
  const fetchEvaluaciones = useCallback(async () => {
    setEvaluacionesLoading(true);
    setEvaluacionesError(null);
    try {
      const res = await fetch("/api/docente/evaluaciones");
      if (res.ok) {
        const data = await res.json();
        setEvaluaciones(data);
      } else {
        const err = await res.json();
        setEvaluacionesError(err.message || "Error al cargar evaluaciones");
      }
    } catch {
      setEvaluacionesError("Error de conexión");
    } finally {
      setEvaluacionesLoading(false);
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect -- fetchEvaluaciones calls setEvaluaciones which is expected */
  useEffect(() => {
    fetchEvaluaciones();
  }, [fetchEvaluaciones]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleCreateEvaluacion = async (data: { titulo: string; grupoId: string; fecha: string; hora: string; descripcion?: string }) => {
    try {
      const fechaInicio = `${data.fecha}T${data.hora}:00`;
      // For now, set end time to 2 hours after start
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
        fetchEvaluaciones(); // Refresh list
      } else {
        throw new Error(responseData.message || "Error al crear evaluación");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al crear evaluación";
      alert(message);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col font-sans">
      <BaseHeader
        user={user}
        role="DOCENTE"
        navigationLinks={navigationLinks}
        onProfile={() => {}}
        onChangePassword={() => {}}
        onLogout={handleLogout}
        brandColor="purple"
        isLoading={userLoading}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Title & Create Button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-4xl leading-relaxed text-[var(--color-text-primary)] tracking-tight">
              Evaluaciones
            </h1>
            <p className="mt-1 font-normal text-base leading-relaxed text-[var(--color-text-secondary)]">
              Gestiona las evaluaciones de tus grupos
            </p>
          </div>
          <button
            onClick={() => setShowCrearEvaluacionModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#6543ab] text-white font-medium text-sm rounded-lg hover:bg-[#533a92] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Crear evaluación
          </button>
        </div>

        {/* Error messages */}
        {(gruposError || evaluacionesError) && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {gruposError || evaluacionesError}
          </div>
        )}

        {/* Content Grid: Left panel (280px) + Right panel (flex-1) */}
        <div className="flex gap-6">
          {/* Left Panel: Grupos */}
          <GrupoSelector
            grupos={gruposForSelector}
            selectedGrupoId={selectedGrupoId}
            onSelectGrupo={setSelectedGrupoId}
          />

          {/* Right Panel: Evaluaciones */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Header */}
            <EvaluacionHeader
              grupoNombre={selectedGrupoId === "all" || selectedGrupoId === null ? null : 
                gruposForSelector.find((g) => g.id === selectedGrupoId)?.nombre || null}
              pendientesCount={pendientesEvaluaciones.length}
              publicadasCount={publicadasEvaluaciones.length}
              finalizadasCount={finalizadasEvaluaciones.length}
            />

            {/* Evaluations Sections */}
            {evaluacionesLoading ? (
              <div className="space-y-6">
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-[#f6f6fa] border border-[#dedee8] rounded-lg" />
                  ))}
                </div>
                <div className="animate-pulse space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 bg-[#e0f2fe] border border-[#dedee8] rounded-lg" />
                  ))}
                </div>
                <div className="animate-pulse space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 bg-[#f6f6fa] border border-[#dedee8] rounded-lg" />
                  ))}
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <CrearEvaluacionModal
        isOpen={showCrearEvaluacionModal}
        onClose={() => setShowCrearEvaluacionModal(false)}
        onCreate={handleCreateEvaluacion}
        grupos={gruposForSelector}
      />
    </div>
  );
}