"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BaseHeader } from "@/components/ui";
import PerfilModal from "../components/modals/PerfilModal";
import CambiarPasswordModal from "../components/modals/CambiarPasswordModal";
import { GroupCard, type AlumnoGroup, type Exam } from "@/components/ui";
import UpcomingExamCard from "../components/exams/UpcomingExamCard";
import ExamsSidebar from "../components/exams/ExamsSidebar";
import ExamConfirmModal from "../components/exams/ExamConfirmModal";
import { useAlumnoGrupos, type AlumnoGrupo } from "@/lib/hooks/useAlumnoGrupos";

interface User {
  id: string;
  nombre_completo: string;
  correo: string;
  institucion: string | null;
  institucion_id: string | null;
  rol: string;
}

function mapGrupoToAlumnoGroup(grupo: AlumnoGrupo): AlumnoGroup {
  return {
    id: grupo.id,
    nombre: grupo.nombre,
    codigo: grupo.codigo,
    categoria: grupo.categoria,
    estudiantes_count: 0,
    exams: grupo.examenes.map((e) => ({
      id: e.id,
      unit: e.titulo,
      date: new Date(e.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).toUpperCase(),
      time: new Date(e.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      status: mapEstadoToStatus(e.estado),
    })),
    expanded: false,
  };
}

function mapEstadoToStatus(estado: AlumnoExamen['estado']): Exam['status'] {
  switch (estado) {
    case 'programada':
    case 'publicada':
      return 'upcoming';
    case 'en_curso':
      return 'upcoming';
    case 'finalizada':
      return 'completed';
    case 'cancelada':
      return 'cancelled';
    default:
      return 'upcoming';
  }
}

type AlumnoExamen = {
  id: string;
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'programada' | 'publicada' | 'en_curso' | 'finalizada' | 'cancelada';
  tiempo_examen: number;
};

export default function AlumnoInicioPage() {
  const { grupos, loading: gruposLoading, error: gruposError, fetchGrupos } = useAlumnoGrupos();
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<{
    id: string;
    titulo: string;
    fecha_inicio: string;
    fecha_fin: string;
    tiempo_examen: number;
  } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchGrupos();
  }, [fetchGrupos]);

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
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();

    const handleUserUpdated = (e: CustomEvent<User>) => {
      setUser(e.detail);
    };
    window.addEventListener("user-updated", handleUserUpdated as EventListener);
    return () => window.removeEventListener("user-updated", handleUserUpdated as EventListener);
  }, []);

  const getSortedExams = (exams: Exam[]) => {
    return [...exams].sort((a, b) => {
      if (a.status === "upcoming" && b.status === "completed") return -1;
      if (a.status === "completed" && b.status === "upcoming") return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleProfile = () => {
    setShowPerfilModal(true);
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handleExamClick = (exam: Exam) => {
    const grupo = groups.find(g => g.exams.some(e => e.id === exam.id));
    const examenOriginal = grupo?.exams.find(e => e.id === exam.id);
    if (examenOriginal) {
      // Buscar la evaluación original en los datos de la API para obtener fecha_fin y tiempo_examen
      const grupoOriginal = grupos.find(g => g.id === grupo?.id);
      const evalOriginal = grupoOriginal?.examenes.find(e => e.id === exam.id);
      if (evalOriginal) {
        setSelectedExam({
          id: evalOriginal.id,
          titulo: evalOriginal.titulo,
          fecha_inicio: evalOriginal.fecha_inicio,
          fecha_fin: evalOriginal.fecha_fin,
          tiempo_examen: evalOriginal.tiempo_examen,
        });
        setShowConfirmModal(true);
      }
    }
  };

  const handleConfirmExam = async () => {
    if (!selectedExam) return;
    try {
      const res = await fetch(`/api/alumno/examenes/${selectedExam.id}/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Error al iniciar evaluación");
        return;
      }
      setShowConfirmModal(false);
      setSelectedExam(null);
      router.push(`/alumno/examenes/${selectedExam.id}/rendir`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      alert(message);
    }
  };

  const groups = grupos.map(mapGrupoToAlumnoGroup);
  const allExams = groups.flatMap(g => g.exams);
  const nextUpcomingExam = allExams
    .filter(e => e.status === "upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const navigationLinks = [
    { href: "/alumno/inicio", label: "Inicio", active: true },
    { href: "/alumno/evaluaciones", label: "Evaluaciones" },
  ];

  if (gruposLoading || userLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col font-sans">
        <BaseHeader
          user={null}
          role="ALUMNO"
          navigationLinks={navigationLinks}
          onProfile={handleProfile}
          onChangePassword={handleChangePassword}
          onLogout={handleLogout}
          brandColor="purple"
          isLoading={true}
        />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full max-w-3xl">
            <div className="h-8 bg-[var(--color-border)] rounded w-3/4" />
            <div className="h-4 bg-[var(--color-border)] rounded w-1/2" />
            <div className="h-4 bg-[var(--color-border)] rounded w-1/3" />
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map(i => (
                <div key={i} className="h-40 bg-[var(--color-border)] rounded" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (gruposError) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col font-sans">
        <BaseHeader
          user={user}
          role="ALUMNO"
          navigationLinks={navigationLinks}
          onProfile={handleProfile}
          onChangePassword={handleChangePassword}
          onLogout={handleLogout}
          brandColor="purple"
          isLoading={false}
        />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 flex items-center justify-center">
          <div className="text-center text-[var(--color-danger)]">
            <p>Error al cargar grupos: {gruposError}</p>
            <button
              onClick={() => fetchGrupos()}
              className="mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
            >
              Reintentar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col font-sans">
      <BaseHeader
        user={user}
        role="ALUMNO"
        navigationLinks={navigationLinks}
        onProfile={handleProfile}
        onChangePassword={handleChangePassword}
        onLogout={handleLogout}
        brandColor="purple"
        isLoading={userLoading}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-semibold text-4xl leading-relaxed text-[var(--color-text-primary)] tracking-tight">
            Tu espacio de aprendizaje
          </h1>
        </div>

        {/* Content Grid: 256px sidebar + rest */}
        <div className="flex gap-6">
          {/* Left Sidebar: Exámenes próximos */}
          <ExamsSidebar exams={allExams} />

          {/* Main Area */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Evaluación por Empezar */}
            {nextUpcomingExam && (
              <UpcomingExamCard
                subject={groups.find(g => g.exams.some(e => e.id === nextUpcomingExam.id))?.nombre || "Materia"}
                unit={nextUpcomingExam.unit}
                questionCount={25}
                onEnter={() => handleExamClick(nextUpcomingExam)}
              />
            )}

            {/* Grupos */}
            <section>
              <h2 className="font-semibold text-lg leading-relaxed text-[var(--color-text-primary)] mb-4">
                Grupos
              </h2>
              <div className="space-y-4 max-w-3xl">
                {groups.length === 0 ? (
                  <div className="bg-white border border-[var(--color-border)] rounded-xl p-8 text-center">
                    <p className="font-normal text-sm leading-normal text-[var(--color-text-secondary)]">
                      No estás inscrito en ningún grupo aún.
                    </p>
                  </div>
                ) : (
                  groups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      variant="alumno"
                      getSortedExams={getSortedExams}
                      onExamClick={handleExamClick}
                    />
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Modales */}
      <PerfilModal
        isOpen={showPerfilModal}
        onClose={() => setShowPerfilModal(false)}
        user={user}
      />
      <CambiarPasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
      <ExamConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedExam(null);
        }}
        exam={selectedExam!}
        onConfirm={handleConfirmExam}
      />
    </div>
  );
}