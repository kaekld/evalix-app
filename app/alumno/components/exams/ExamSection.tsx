"use client";

import { useMemo } from "react";
import { EvaluacionWithIntento } from "./types";
import ExamCard from "./ExamCard";

interface ExamSectionProps {
  title: string;
  exams: EvaluacionWithIntento[];
  emptyMessage: string;
  onExamClick?: (exam: EvaluacionWithIntento) => void;
  onStartExam?: (evaluacionId: string) => void;
  onViewResult?: (evaluacionId: string) => void;
  showActions?: boolean;
}

function getSortedExams(exams: EvaluacionWithIntento[]) {
  return [...exams].sort((a, b) => {
    const statusOrder = { completed: 0, pending: 1, cancelled: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return new Date(b.evaluacion.fecha_inicio).getTime() - new Date(a.evaluacion.fecha_inicio).getTime();
  });
}

const statusColors = {
  completed: { bg: "bg-[#e5f2e8]", text: "text-[#336647]", dot: "bg-[#336647]" },
  pending: { bg: "bg-[#f0eafb]", text: "text-[#6543ab]", dot: "bg-[#6543ab]" },
  cancelled: { bg: "bg-[#fef2f2]", text: "text-[#cc3333]", dot: "bg-[#cc3333]" },
};

export default function ExamSection({
  title,
  exams,
  emptyMessage,
  onExamClick,
  onStartExam,
  onViewResult,
  showActions = false,
}: ExamSectionProps) {
  const sortedExams = useMemo(() => getSortedExams(exams), [exams]);

  return (
    <section className="space-y-4" aria-labelledby={title.toLowerCase().replace(/\s+/g, '-')}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm leading-relaxed text-[#232334]">
          {title} <span className="font-normal text-[#747487]">({exams.length})</span>
        </h3>
      </div>
      {sortedExams.length === 0 ? (
        <div className="bg-white border border-[#dedee8] rounded-xl p-10 text-center">
          <svg className="w-12 h-12 mx-auto text-[#dedee8] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="font-normal text-base leading-normal text-[#747487]">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3" role="list">
          {sortedExams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onClick={() => onExamClick?.(exam)}
              onStart={() => onStartExam?.(exam.evaluacion.id)}
              onViewResult={() => onViewResult?.(exam.evaluacion.id)}
              isClickable={!!onExamClick && exam.status === "pending"}
              showActions={showActions}
            />
          ))}
        </div>
      )}
    </section>
  );
}