"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { BaseHeader } from "@/components/ui";
import GroupSelector from "../components/exams/GroupSelector";
import SubjectHeader from "../components/exams/SubjectHeader";
import ExamSection from "../components/exams/ExamSection";
import {
  type Exam,
  getStatusStyles,
  getSortedExams,
} from "../components/exams/types";
import { useAlumnoGrupos, type AlumnoGrupo } from "@/lib/hooks/useAlumnoGrupos";

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

interface EvaluacionWithIntento {
  id: string;
  unit: string;
  date: string;
  time?: string;
  status: "pending" | "cancelled" | "completed";
  evaluacion: {
    id: string;
    titulo: string;
    descripcion: string | null;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
    tiempo_examen: number;
    orden_aleatorio: boolean;
  };
  intento: {
    id: string;
    estado: string;
    iniciado_en: string;
    completado_en: string | null;
  } | null;
}

const navigationLinks = [
  { href: "/alumno/inicio", label: "Inicio" },
  { href: "/alumno/examenes", label: "Exámenes", active: true },
];

const years = [2026, 2025, 2024, 2023];

export default function AlumnoExamenesPage() {
  const { grupos, fetchGrupos } = useAlumnoGrupos();
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionWithIntento[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
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
    try {
      const res = await fetch(`/api/alumno/grupos/${grupoId}/evaluaciones`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al cargar exámenes");
      }
      const data = await res.json();
      setEvaluaciones(data);
      setSelectedGroupId(grupoId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      console.error(message);
    }
  }, []);

  useEffect(() => {
    if (grupos.length > 0 && !selectedGroupId && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchEvaluaciones(grupos[0].id);
    }
  }, [grupos, selectedGroupId, fetchEvaluaciones]);

  const toExam = (e: EvaluacionWithIntento): Exam => ({
    id: Number(e.id) || 0,
    unit: e.unit,
    date: e.date,
    time: e.time,
    status: e.status,
    subjectId: selectedGroupId ? Number(selectedGroupId) : 1,
  });

  const pendingExams = evaluaciones.filter((e) => e.status === "pending").map(toExam);
  const cancelledExams = evaluaciones.filter((e) => e.status === "cancelled").map(toExam);
  const completedExams = evaluaciones.filter((e) => e.status === "completed").map(toExam);

  const selectedGroup = grupos.find((g) => g.id === selectedGroupId);

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
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-semibold text-4xl leading-relaxed text-[var(--color-text-primary)] tracking-tight">
            Mis Exámenes
          </h1>
        </div>

        {/* Content Grid: Left panel (280px) + Right panel (flex-1) */}
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
              } : undefined}
              completedCount={completedExams.length}
              pendingCount={pendingExams.length}
              cancelledCount={cancelledExams.length}
            />

            {/* Exams Sections */}
            <div className="space-y-6">
              <ExamSection
                title="Exámenes pendientes"
                exams={pendingExams}
                emptyMessage="No hay exámenes pendientes."
                getStatusStyles={getStatusStyles}
                getSortedExams={getSortedExams}
              />
              <ExamSection
                title="Exámenes cancelados"
                exams={cancelledExams}
                emptyMessage="No hay exámenes cancelados."
                getStatusStyles={getStatusStyles}
                getSortedExams={getSortedExams}
              />
              <ExamSection
                title="Exámenes realizados"
                exams={completedExams}
                emptyMessage="No hay exámenes realizados."
                getStatusStyles={getStatusStyles}
                getSortedExams={getSortedExams}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}