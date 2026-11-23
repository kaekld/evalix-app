"use client";

import { type Exam } from "@/components/ui";

interface ExamsSidebarProps {
  exams: Exam[];
}

export default function ExamsSidebar({ exams }: ExamsSidebarProps) {
  const upcomingExams = exams.filter(e => e.status === "upcoming");
  const nextExam = upcomingExams[0];

  return (
    <aside className="w-64 flex-shrink-0">
      <div className="bg-white border border-[var(--color-border)] rounded-xl h-[26.5rem] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="font-semibold text-sm leading-relaxed text-[var(--color-text-primary)]">
            Exámenes próximos
          </h2>
        </div>
        <div className="p-4">
          {nextExam ? (
            <div className="border-b border-[var(--color-border)] pb-4">
              <p className="font-semibold text-xs leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-wrap">
                {nextExam.date} {nextExam.time ? `· ${nextExam.time}` : ""}
              </p>
              <p className="font-medium text-base leading-relaxed text-[var(--color-text-primary)] mt-1">
                {nextExam.unit}
              </p>
            </div>
          ) : (
            <p className="font-normal text-sm leading-normal text-[var(--color-text-secondary)] text-center py-8">
              No hay exámenes próximos
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}