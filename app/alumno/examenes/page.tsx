"use client";

import { useState } from "react";
import Link from "next/link";
import AlumnoHeader from "../components/AlumnoHeader";
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

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleProfile = () => {
    setUserMenuOpen(false);
  };

  const handleChangePassword = () => {
    setUserMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f6f6fa] flex flex-col font-sans">
      <AlumnoHeader
        user={null}
        onProfile={handleProfile}
        onChangePassword={handleChangePassword}
        onLogout={handleLogout}
      />

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