"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AlumnoHeader from "../components/AlumnoHeader";
import PerfilModal from "../components/modals/PerfilModal";
import CambiarPasswordModal from "../components/modals/CambiarPasswordModal";
import GroupCard from "../components/groups/GroupCard";
import UpcomingExamCard from "../components/exams/UpcomingExamCard";
import ExamsSidebar from "../components/exams/ExamsSidebar";

interface Exam {
  id: number;
  unit: string;
  date: string;
  time?: string;
  status: "upcoming" | "completed";
}

interface Group {
  id: number;
  name: string;
  code: string;
  students: string;
  exams: Exam[];
  expanded: boolean;
}

interface User {
  id: string;
  nombre_completo: string;
  correo: string;
  institucion: string | null;
  institucion_id: string | null;
  rol: string;
}

const groupsData: Group[] = [
  {
    id: 1,
    name: "Programación Orientada a Objetos",
    code: "Grupo A · 24 estudiantes",
    students: "24 estudiantes",
    exams: [
      { id: 1, unit: "Unidad 1", date: "12 NOV 2026", status: "completed" },
    ],
    expanded: false,
  },
  {
    id: 2,
    name: "Sistemas Programables",
    code: "Grupo B · 18 estudiantes",
    students: "18 estudiantes",
    exams: [
      { id: 2, unit: "Unidad 2", date: "20 NOV · 11:00 h", status: "upcoming" },
      { id: 3, unit: "Unidad 1", date: "15 NOV 2026", status: "completed" },
    ],
    expanded: false,
  },
];

export default function AlumnoInicioPage() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>(groupsData);
  const [user, setUser] = useState<User | null>(null);
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
            institucion: null,
            institucion_id: null,
            rol: data.rol,
          });
        }
      } catch {
        // Usuario no autenticado, el middleware redirigirá
      }
    };
    fetchUser();

    const handleUserUpdated = (e: CustomEvent<User>) => {
      setUser(e.detail);
    };
    window.addEventListener("user-updated", handleUserUpdated as EventListener);
    return () => window.removeEventListener("user-updated", handleUserUpdated as EventListener);
  }, []);

  const toggleGroup = (groupId: number) => {
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
    setUserMenuOpen(false);
    setShowPerfilModal(true);
  };

  const handleChangePassword = () => {
    setUserMenuOpen(false);
    setShowPasswordModal(true);
  };

  // Get next upcoming exam across all groups
  const allExams = groups.flatMap(g => g.exams);
  const nextUpcomingExam = allExams
    .filter(e => e.status === "upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div className="min-h-screen bg-[#f6f6fa] flex flex-col font-sans">
      <AlumnoHeader
        user={user}
        onProfile={handleProfile}
        onChangePassword={handleChangePassword}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-semibold text-4xl leading-relaxed text-[#232334] tracking-tight">
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
                subject={groups.find(g => g.exams.some(e => e.id === nextUpcomingExam.id))?.name || "Materia"}
                unit={nextUpcomingExam.unit}
                questionCount={25}
                onEnter={() => {}}
              />
            )}

            {/* Grupos */}
            <section>
              <h2 className="font-semibold text-lg leading-relaxed text-[#232334] mb-4">
                Grupos
              </h2>
              <div className="space-y-4 max-w-3xl">
                {groups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
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