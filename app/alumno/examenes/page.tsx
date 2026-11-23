"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BaseHeader } from "@/components/ui";
import SubjectSelector from "../components/exams/SubjectSelector";
import SubjectHeader from "../components/exams/SubjectHeader";
import ExamSection from "../components/exams/ExamSection";
import {
  subjectsData,
  examsData,
  years,
  getStatusStyles,
  getSortedExams,
} from "../components/exams/types";

interface User {
  id: string;
  nombre_completo: string;
  correo: string;
  institucion: string | null;
  institucion_id: string | null;
  rol: string;
}

const navigationLinks = [
  { href: "/alumno/inicio", label: "Inicio", active: true },
  { href: "/alumno/examenes", label: "Exámenes" },
];

export default function AlumnoExamenesPage() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(1);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const router = useRouter();

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

  const filteredExams = examsData.filter(
    (exam) => exam.subjectId === selectedSubjectId
  );

  const pendingExams = filteredExams.filter((e) => e.status === "pending");
  const cancelledExams = filteredExams.filter((e) => e.status === "cancelled");
  const completedExams = filteredExams.filter((e) => e.status === "completed");

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleProfile = () => {};

  const handleChangePassword = () => {};

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
          {/* Left Panel: Periodo & Materias */}
          <SubjectSelector
            subjects={subjectsData}
            selectedSubjectId={selectedSubjectId}
            onSelectSubject={setSelectedSubjectId}
            selectedYear={selectedYear}
            onSelectYear={setSelectedYear}
            years={years}
          />

          {/* Right Panel: Exámenes */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Subject Header */}
            <SubjectHeader
              subject={subjectsData.find((s) => s.id === selectedSubjectId)}
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