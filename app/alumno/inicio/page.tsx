"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BaseHeader } from "@/components/ui";
import PerfilModal from "../components/modals/PerfilModal";
import CambiarPasswordModal from "../components/modals/CambiarPasswordModal";
import { GroupCard, type AlumnoGroup, type Exam } from "@/components/ui";
import UpcomingExamCard from "../components/exams/UpcomingExamCard";
import ExamsSidebar from "../components/exams/ExamsSidebar";

interface User {
  id: string;
  nombre_completo: string;
  correo: string;
  institucion: string | null;
  institucion_id: string | null;
  rol: string;
}

const groupsData: AlumnoGroup[] = [
  {
    id: 1,
    nombre: "Programación Orientada a Objetos",
    codigo: "Grupo A · 24 estudiantes",
    categoria: "Programación",
    estudiantes_count: 24,
    exams: [
      { id: "1", unit: "Unidad 1", date: "12 NOV 2026", status: "completed" },
    ],
    expanded: false,
  },
  {
    id: 2,
    nombre: "Sistemas Programables",
    codigo: "Grupo B · 18 estudiantes",
    categoria: "Sistemas",
    estudiantes_count: 18,
    exams: [
      { id: "2", unit: "Unidad 2", date: "20 NOV · 11:00 h", status: "upcoming" },
      { id: "3", unit: "Unidad 1", date: "15 NOV 2026", status: "completed" },
    ],
    expanded: false,
  },
];

export default function AlumnoInicioPage() {
  const [groups, setGroups] = useState<AlumnoGroup[]>(groupsData);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const router = useRouter();

  // Obtener usuario desde el servidor (cookie HttpOnly)
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

    const handleUserUpdated = (e: CustomEvent<User>) => {
      setUser(e.detail);
    };
    window.addEventListener("user-updated", handleUserUpdated as EventListener);
    return () => window.removeEventListener("user-updated", handleUserUpdated as EventListener);
  }, []);

  const toggleGroup = (groupId: number | string) => {
    setGroups(groups.map((g) =>
      g.id === groupId ? { ...g, expanded: !g.expanded } : g
    ));
  };

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

  // Get next upcoming exam across all groups
  const allExams = groups.flatMap(g => g.exams);
  const nextUpcomingExam = allExams
    .filter(e => e.status === "upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const navigationLinks = [
    { href: "/alumno/inicio", label: "Inicio", active: true },
    { href: "/alumno/examenes", label: "Exámenes" },
  ];

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
            {/* Examen por Empezar */}
            {nextUpcomingExam && (
              <UpcomingExamCard
                subject={groups.find(g => g.exams.some(e => e.id === nextUpcomingExam.id))?.nombre || "Materia"}
                unit={nextUpcomingExam.unit}
                questionCount={25}
                onEnter={() => {}}
              />
            )}

            {/* Grupos */}
            <section>
              <h2 className="font-semibold text-lg leading-relaxed text-[var(--color-text-primary)] mb-4">
                Grupos
              </h2>
              <div className="space-y-4 max-w-3xl">
                {groups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    variant="alumno"
                    onToggle={toggleGroup}
                    getSortedExams={getSortedExams}
                  />
                ))}
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
    </div>
  );
}