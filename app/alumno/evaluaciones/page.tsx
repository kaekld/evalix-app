"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BaseHeader } from "@/components/ui";
import GroupSelector from "../components/exams/GroupSelector";
import SubjectHeader from "../components/exams/SubjectHeader";
import ExamSection from "../components/exams/ExamSection";
import ExamStartModal from "../components/exams/ExamStartModal";
import ResultModal from "../components/exams/ResultModal";
import { useAlumnoGrupos, type AlumnoGrupo } from "@/lib/hooks/useAlumnoGrupos";
import { EvaluacionWithIntento } from "../components/exams/types";

interface User {
  id: string;
  nombre_completo: string;
  correo: string;
  institucion: string | null;
  institucion_id: string | null;
  rol: string;
}

interface GroupWithExams extends AlumnoGrupo {
  examSummaries: ExamSummary[];
}

interface ExamSummary {
  id: string;
  titulo: string;
  fecha_inicio: string;
  estado: 'programada' | 'publicada' | 'en_curso' | 'finalizada' | 'cancelada';
}

const navigationLinks = [
  { href: "/alumno/inicio", label: "Inicio" },
  { href: "/alumno/evaluaciones", label: "Evaluaciones", active: true },
];

const years = [2026, 2025, 2024, 2023];

export default function AlumnoExamenesPage() {
  const { grupos, fetchGrupos, loading: gruposLoading } = useAlumnoGrupos();
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionWithIntento[]>([]);
  const [evaluacionesLoading, setEvaluacionesLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<EvaluacionWithIntento | null>(null);
  const [selectedResult, setSelectedResult] = useState<EvaluacionWithIntento | null>(null);
  const router = useRouter();
  const initialFetchDone = useRef(false);

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
  }, []);

  const fetchEvaluaciones = useCallback(async (grupoId: string) => {
    setEvaluacionesLoading(true);
    try {
      const res = await fetch(`/api/alumno/grupos/${grupoId}/evaluaciones`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al cargar exámenes");
      }
      const data = await res.json();
      setEvaluaciones(data);
      setSelectedGroupId(grupoId);
      setSelectedExam(null);
      setSelectedResult(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      console.error(message);
      setEvaluaciones([]);
    } finally {
      setEvaluacionesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (grupos.length > 0 && !selectedGroupId && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchEvaluaciones(grupos[0].id);
    }
  }, [grupos, selectedGroupId, fetchEvaluaciones]);

  const pendingExams = useMemo(
    () => evaluaciones.filter((e) => e.status === "pending"),
    [evaluaciones]
  );
  const cancelledExams = useMemo(
    () => evaluaciones.filter((e) => e.status === "cancelled"),
    [evaluaciones]
  );
  const completedExams = useMemo(
    () => evaluaciones.filter((e) => e.status === "completed"),
    [evaluaciones]
  );

  const selectedGroup = useMemo(
    () => grupos.find((g) => g.id === selectedGroupId),
    [grupos, selectedGroupId]
  );

  const handleExamClick = (exam: EvaluacionWithIntento) => {
    setSelectedExam(exam);
  };

  const handleStartExam = async (evaluacionId: string) => {
    try {
      const res = await fetch(`/api/alumno/examenes/${evaluacionId}/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Error al iniciar evaluación");
        return;
      }
      setSelectedExam(null);
      router.push(`/alumno/examenes/${evaluacionId}/rendir`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      alert(message);
    }
  };

  const handleViewResult = (evaluacionId: string) => {
    const exam = evaluaciones.find((e) => e.evaluacion.id === evaluacionId);
    if (exam) {
      setSelectedResult(exam);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleProfile = () => {};
  const handleChangePassword = () => {};

  if (userLoading) {
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
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-semibold text-4xl leading-relaxed text-[var(--color-text-primary)] tracking-tight">
            Mis Evaluaciones
          </h1>
          <p className="font-normal text-base leading-relaxed text-[var(--color-text-secondary)] mt-1">
            Consulta tus evaluaciones pendientes, en curso y realizadas por grupo
          </p>
        </div>

        {/* Content Grid: Left panel (288px) + Right panel (flex-1) */}
        <div className="flex gap-6">
          {/* Left Panel: Periodo & Grupos */}
          <GroupSelector
            groups={grupos as GroupWithExams[]}
            selectedGroupId={selectedGroupId}
            onSelectGroup={fetchEvaluaciones}
            selectedYear={selectedYear}
            onSelectYear={setSelectedYear}
            years={years}
          />

          {/* Right Panel: Exámenes */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Group Header */}
            <SubjectHeader
              subject={selectedGroup ? {
                id: Number(selectedGroup.id) || 1,
                name: selectedGroup.nombre,
                code: selectedGroup.codigo,
                categoria: selectedGroup.categoria,
              } : undefined}
              completedCount={completedExams.length}
              pendingCount={pendingExams.length}
              cancelledCount={cancelledExams.length}
            />

            {evaluacionesLoading && (
              <div className="space-y-3" role="status" aria-label="Cargando evaluaciones">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-white border border-[#dedee8] rounded-xl p-5">
                    <div className="h-5 bg-[#dedee8] rounded w-1/3 mb-3" />
                    <div className="h-4 bg-[#dedee8] rounded w-1/2" />
                    <div className="h-4 bg-[#dedee8] rounded w-1/4 mt-2" />
                  </div>
                ))}
              </div>
            )}

            {!evaluacionesLoading && (
              <div className="space-y-6">
                <ExamSection
                  title="Evaluaciones pendientes"
                  exams={pendingExams}
                  emptyMessage="No hay evaluaciones pendientes en este grupo."
                  onExamClick={handleExamClick}
                  onStartExam={handleStartExam}
                  onViewResult={handleViewResult}
                  showActions={true}
                />
                <ExamSection
                  title="Evaluaciones realizadas"
                  exams={completedExams}
                  emptyMessage="No hay evaluaciones realizadas en este grupo."
                  onExamClick={handleExamClick}
                  onStartExam={handleStartExam}
                  onViewResult={handleViewResult}
                  showActions={true}
                />
                <ExamSection
                  title="Evaluaciones canceladas"
                  exams={cancelledExams}
                  emptyMessage="No hay evaluaciones canceladas en este grupo."
                  onExamClick={handleExamClick}
                  onStartExam={handleStartExam}
                  onViewResult={handleViewResult}
                  showActions={false}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Iniciar Evaluación */}
      {selectedExam && (
        <ExamStartModal
          isOpen={true}
          onClose={() => setSelectedExam(null)}
          exam={selectedExam.evaluacion}
          onStart={handleStartExam}
        />
      )}

      {/* Modal Ver Resultado */}
      {selectedResult && (
        <ResultModal
          isOpen={true}
          onClose={() => setSelectedResult(null)}
          exam={selectedResult}
        />
      )}
    </div>
  );
}
