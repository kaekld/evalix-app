"use client";

import { useState } from "react";
import Link from "next/link";

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface Exam {
  id: number;
  unit: string;
  date: string;
  time?: string;
  status: "pending" | "cancelled" | "completed";
  subjectId: number;
}

const subjectsData: Subject[] = [
  { id: 1, name: "Programación Orientada a Objetos", code: "POO-101" },
  { id: 2, name: "Sistemas Programables", code: "SP-201" },
  { id: 3, name: "Arquitectura de Computadoras", code: "AC-301" },
];

const examsData: Exam[] = [
  // Programación Orientada a Objetos (id: 1)
  { id: 1, unit: "Unidad 1", date: "12 NOV 2026", time: "10:00 h", status: "completed", subjectId: 1 },
  { id: 2, unit: "Unidad 2", date: "25 NOV 2026", time: "10:00 h", status: "pending", subjectId: 1 },
  { id: 3, unit: "Unidad 3", date: "10 DIC 2026", time: "10:00 h", status: "pending", subjectId: 1 },
  { id: 4, unit: "Unidad 4", date: "05 ENE 2027", time: "10:00 h", status: "cancelled", subjectId: 1 },

  // Sistemas Programables (id: 2)
  { id: 5, unit: "Unidad 1", date: "15 NOV 2026", time: "11:00 h", status: "completed", subjectId: 2 },
  { id: 6, unit: "Unidad 2", date: "28 NOV 2026", time: "11:00 h", status: "pending", subjectId: 2 },
  { id: 7, unit: "Unidad 3", date: "12 DIC 2026", time: "11:00 h", status: "cancelled", subjectId: 2 },

  // Arquitectura de Computadoras (id: 3)
  { id: 8, unit: "Unidad 1", date: "18 NOV 2026", time: "09:00 h", status: "completed", subjectId: 3 },
  { id: 9, unit: "Unidad 2", date: "02 DIC 2026", time: "09:00 h", status: "pending", subjectId: 3 },
  { id: 10, unit: "Unidad 3", date: "15 DIC 2026", time: "09:00 h", status: "pending", subjectId: 3 },
  { id: 11, unit: "Unidad 4", date: "08 ENE 2027", time: "09:00 h", status: "cancelled", subjectId: 3 },
];

const years = [2026, 2025, 2024, 2023];

export default function AlumnoExamenesPage() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(1);

  const filteredExams = examsData.filter(
    (exam) => exam.subjectId === selectedSubjectId
  );

  const pendingExams = filteredExams.filter((e) => e.status === "pending");
  const cancelledExams = filteredExams.filter((e) => e.status === "cancelled");
  const completedExams = filteredExams.filter((e) => e.status === "completed");

  const getStatusStyles = (status: Exam["status"]) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-[#f0eafb]",
          badgeBg: "bg-white",
          badgeText: "text-[#6543ab]",
          badgeLabel: "Pendiente",
          datePrefix: "",
        };
      case "cancelled":
        return {
          bg: "bg-[#fef2f2]",
          badgeBg: "bg-white",
          badgeText: "text-[#cc3333]",
          badgeLabel: "Cancelado",
          datePrefix: "",
        };
      case "completed":
        return {
          bg: "bg-[#f6f6fa]",
          badgeBg: "bg-[#e5f2e8]",
          badgeText: "text-[#336647]",
          badgeLabel: "Realizado",
          datePrefix: "Examen realizado · ",
        };
    }
  };

  const getSortedExams = (exams: Exam[]) => {
    return [...exams].sort((a, b) => {
      // Completed first, then pending, then cancelled
      const statusOrder = { completed: 0, pending: 1, cancelled: 2 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      // For same status, most recent first
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };

  const renderExamSection = (
    title: string,
    exams: Exam[],
    emptyMessage: string
  ) => {
    const sortedExams = getSortedExams(exams);

    return (
      <section className="space-y-4">
        <h3 className="font-semibold text-sm leading-relaxed text-[#232334]">
          {title} ({exams.length})
        </h3>
        {sortedExams.length === 0 ? (
          <div className="bg-white border border-[#dedee8] rounded-xl p-8 text-center">
            <p className="font-normal text-sm leading-normal text-[#747487]">
              {emptyMessage}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedExams.map((exam) => {
              const styles = getStatusStyles(exam.status);
              return (
                <div
                  key={exam.id}
                  className={`rounded-lg p-4 ${styles.bg} border border-[#dedee8] transition-shadow hover:shadow-md`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base leading-normal text-[#232334]">
                        {exam.unit}
                      </p>
                      <p className="font-normal text-xs leading-normal text-[#747487] mt-0.5">
                        {styles.datePrefix}{exam.date}{exam.time ? ` · ${exam.time}` : ""}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center justify-center px-3 h-7 rounded-full ${styles.badgeBg} font-semibold text-xs leading-normal ${styles.badgeText}`}>
                        {styles.badgeLabel}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
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
              <Link href="/alumno/inicio" className="px-4 h-10 rounded-lg font-medium text-base leading-relaxed text-[#747487] hover:bg-[#f6f6fa] transition-colors flex items-center justify-center">
                Inicio
              </Link>
              <Link href="/alumno/examenes" className="px-4 h-10 rounded-lg bg-[#f0eafb] font-semibold text-base leading-relaxed text-[#6543ab] flex items-center justify-center">
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
            Mis Exámenes
          </h1>
        </div>

        {/* Content Grid: Left panel (280px) + Right panel (flex-1) */}
        <div className="flex gap-6">
          {/* Left Panel: Periodo & Materias */}
          <aside className="w-[280px] flex-shrink-0">
            <div className="bg-white border border-[#dedee8] rounded-xl h-full min-h-[600px] overflow-hidden flex flex-col">
              {/* Periodo Header */}
              <div className="px-5 py-4 border-b border-[#dedee8]">
                <h2 className="font-semibold text-sm leading-relaxed text-[#232334] mb-3">
                  Periodo
                </h2>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#dedee8] rounded-lg text-sm font-medium text-[#232334] bg-white focus:outline-none focus:ring-2 focus:ring-[#6543ab] focus:border-transparent appearance-none cursor-pointer"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Materias List */}
              <div className="flex-1 overflow-y-auto p-4">
                <p className="font-semibold text-xs leading-relaxed text-[#747487] mb-3 uppercase tracking-wide">
                  Materias
                </p>
                <div className="space-y-2">
                  {subjectsData.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubjectId(subject.id)}
                      className={`w-full px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        selectedSubjectId === subject.id
                          ? "bg-[#f0eafb] border border-[#6543ab]"
                          : "border border-transparent hover:bg-[#f6f6fa] hover:border-[#dedee8]"
                      }`}
                    >
                      <p className={`font-semibold text-sm leading-relaxed truncate ${
                        selectedSubjectId === subject.id
                          ? "text-[#6543ab]"
                          : "text-[#232334]"
                      }`}>
                        {subject.name}
                      </p>
                      <p className={`font-normal text-xs leading-relaxed mt-1 truncate ${
                        selectedSubjectId === subject.id
                          ? "text-[#6543ab]/80"
                          : "text-[#747487]"
                      }`}>
                        {subject.code}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Panel: Exámenes */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Subject Header */}
            {selectedSubjectId && (
              <div className="bg-white border border-[#dedee8] rounded-xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-xl leading-relaxed text-[#232334]">
                      {subjectsData.find((s) => s.id === selectedSubjectId)?.name}
                    </p>
                    <p className="font-normal text-sm leading-relaxed text-[#747487] mt-1">
                      {subjectsData.find((s) => s.id === selectedSubjectId)?.code}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#747487]">
                    <span className="font-medium text-[#336647]">{completedExams.length} realizados</span>
                    <span className="font-medium text-[#6543ab]">{pendingExams.length} pendientes</span>
                    <span className="font-medium text-[#cc3333]">{cancelledExams.length} cancelados</span>
                  </div>
                </div>
              </div>
            )}

            {/* Exams Sections */}
            <div className="space-y-6">
              {renderExamSection(
                "Exámenes pendientes",
                pendingExams,
                "No hay exámenes pendientes."
              )}
              {renderExamSection(
                "Exámenes cancelados",
                cancelledExams,
                "No hay exámenes cancelados."
              )}
              {renderExamSection(
                "Exámenes realizados",
                completedExams,
                "No hay exámenes realizados."
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}