"use client";

import { Exam, getStatusStyles as GetStatusStyles, getSortedExams as GetSortedExams } from "./types";

interface ExamSectionProps {
  title: string;
  exams: Exam[];
  emptyMessage: string;
  getStatusStyles: typeof GetStatusStyles;
  getSortedExams: typeof GetSortedExams;
  onExamClick?: (exam: Exam) => void;
}

export default function ExamSection({
  title,
  exams,
  emptyMessage,
  getStatusStyles,
  getSortedExams,
  onExamClick,
}: ExamSectionProps) {
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
            const isClickable = onExamClick && exam.status === "pending";
            return (
              <div
                key={exam.id}
                className={`rounded-lg p-4 ${styles.bg} border border-[#dedee8] transition-shadow hover:shadow-md ${isClickable ? "cursor-pointer hover:bg-opacity-90" : ""}`}
                onClick={isClickable ? () => onExamClick(exam) : undefined}
                role={isClickable ? "button" : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={isClickable ? (e) => { if (e.key === "Enter" || e.key === " ") onExamClick(exam); } : undefined}
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
}