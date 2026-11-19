"use client";

import { useState } from "react";
import Link from "next/link";

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

  const toggleGroup = (groupId: number) => {
    setGroups(groups.map((g) =>
      g.id === groupId ? { ...g, expanded: !g.expanded } : g
    ));
  };

  const getSortedExams = (exams: Exam[]) => {
    return [...exams].sort((a, b) => {
      // Upcoming first
      if (a.status === "upcoming" && b.status === "completed") return -1;
      if (a.status === "completed" && b.status === "upcoming") return 1;
      // For completed, most recent first (by date)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f6fa] flex flex-col font-sans">
      {/* Top Navigation Bar - 88px, white, full width */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#dedee8]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-22 gap-4">
            {/* Left: Logo + Institution */}
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-2xl leading-relaxed text-[#6543ab] truncate">
                Evalix
              </span>
              <span className="font-medium text-xs leading-relaxed text-[#747487] truncate">
                Instituto Tecnológico
              </span>
            </div>

            {/* Center: Tabs */}
            <nav className="hidden lg:flex items-center gap-2">
              <Link href="/alumno/inicio" className="px-4 h-10 rounded-lg bg-[#f0eafb] font-semibold text-base leading-relaxed text-[#6543ab] flex items-center justify-center">
                Inicio
              </Link>
              <Link href="/alumno/examenes" className="px-4 h-10 rounded-lg font-medium text-base leading-relaxed text-[#747487] hover:bg-[#f6f6fa] transition-colors flex items-center justify-center">
                Exámenes
              </Link>
            </nav>

            {/* Right: Mi cuenta button */}
            <div className="relative">
              <button
                className="flex items-center justify-center px-4 h-10 rounded-lg bg-[#f6f6fa] font-semibold text-sm leading-relaxed text-[#232334] hover:bg-[#ede6f8] transition-colors"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
              >
                Mi cuenta
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-[#dedee8] shadow-lg py-1 z-40">
                    <div className="px-4 py-3 border-b border-[#dedee8]">
                      <p className="text-sm font-medium text-[#232334]">Carlos Rodríguez</p>
                      <p className="text-xs text-[#747487]">carlos.rodriguez@institucion.edu</p>
                    </div>
                    <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-[#232334] hover:bg-[#f6f6fa] font-medium">
                      Mi perfil
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-[#232334] hover:bg-[#f6f6fa] font-medium">
                      Historial
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-[#232334] hover:bg-[#f6f6fa] font-medium">
                      Ayuda
                    </a>
                    <hr className="my-1 border-[#dedee8]" />
                    <a href="/login" className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-[#f6f6fa] font-medium">
                      Cerrar sesión
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

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
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white border border-[#dedee8] rounded-xl h-[424px] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#dedee8]">
                <h2 className="font-semibold text-sm leading-relaxed text-[#232334]">
                  Exámenes próximos
                </h2>
              </div>
              <div className="p-4">
                <div className="border-b border-[#dedee8] pb-4">
                  <p className="font-semibold text-xs leading-relaxed text-[#747487] whitespace-pre-wrap">
                    20 NOV  ·  11:00 h
                  </p>
                  <p className="font-medium text-base leading-relaxed text-[#232334] mt-1">
                    Sistemas Programables
                  </p>
                  <p className="font-normal text-xs leading-relaxed text-[#747487] mt-1">
                    Unidad 2
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Area */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Examen por Empezar */}
            <section>
              <h2 className="font-semibold text-sm leading-relaxed text-[#232334] mb-4">
                Examen por Empezar
              </h2>
              <div className="bg-[#e4f7fb] rounded-xl p-6 max-w-3xl min-h-[151px]">
                <p className="font-semibold text-2xl leading-relaxed text-[#232334] mb-2">
                  Programación Orientada a Objetos
                </p>
                <p className="font-normal text-sm leading-relaxed text-black mb-6">
                  Unidad 1 · 25 preguntas
                </p>
                <button className="flex items-center justify-center px-4 h-10 rounded-lg bg-[#44689e] font-semibold text-sm leading-relaxed text-white w-[151px] hover:bg-[#3a5a8a] transition-colors">
                  Entrar a examen
                </button>
              </div>
            </section>

            {/* Grupos */}
            <section>
              <h2 className="font-semibold text-lg leading-relaxed text-[#232334] mb-4">
                Grupos
              </h2>
              <div className="space-y-4 max-w-3xl">
                {groups.map((group) => {
                  const sortedExams = getSortedExams(group.exams);
                  return (
                    <div
                      key={group.id}
                      className="bg-white border border-[#dedee8] rounded-xl overflow-hidden"
                    >
                      {/* Group Header - clickable */}
                      <button
                        onClick={() => toggleGroup(group.id)}
                        className="w-full px-4 py-4 relative h-22 flex items-center justify-between gap-4 text-left"
                      >
                        <div className="absolute left-0 top-4 w-1 h-11 bg-[#95c9a4] rounded" />
                        <div className="pl-6 flex-1 min-w-0">
                          <p className="font-semibold text-base leading-relaxed text-[#232334] truncate">
                            {group.name}
                          </p>
                          <p className="font-normal text-xs leading-relaxed text-[#747487] mt-1 truncate">
                            {group.code}
                          </p>
                        </div>
                        <span className={`flex-shrink-0 font-medium text-2xl leading-relaxed text-[#6543ab] transition-transform duration-200 ${group.expanded ? "rotate-180" : ""}`}>
                          ⌄
                        </span>
                      </button>

                      {/* Expanded Content */}
                      {group.expanded && (
                        <div className="border-t border-[#dedee8] px-4 pb-4 animate-fade-in">
                          {sortedExams.length === 0 ? (
                            <p className="font-normal text-sm leading-normal text-[#747487] pt-4">
                              No hay ningún examen registrado.
                            </p>
                          ) : (
                            <div className="space-y-3 pt-4">
                              {sortedExams.map((exam) => (
                                <div
                                  key={exam.id}
                                  className={`rounded-lg p-4 ${
                                    exam.status === "upcoming"
                                      ? "bg-[#f0eafb]"
                                      : "bg-[#f6f6fa]"
                                  }`}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-base leading-normal text-[#232334]">
                                        {exam.unit}
                                      </p>
                                      <p className="font-normal text-xs leading-normal text-[#747487] mt-0.5">
                                        {exam.status === "upcoming" ? exam.date : `Examen realizado · ${exam.date}`}
                                      </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                      {exam.status === "upcoming" ? (
                                        <span className="inline-flex items-center justify-center px-3 h-7 rounded-full bg-white font-semibold text-xs leading-normal text-[#6543ab]">
                                          Próximo
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center justify-center px-3 h-7 rounded-full bg-[#e5f2e8] font-semibold text-xs leading-normal text-[#336647]">
                                          Realizado
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}