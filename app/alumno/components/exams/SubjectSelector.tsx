"use client";

import { Subject } from "./types";

interface SubjectSelectorProps {
  subjects: Subject[];
  selectedSubjectId: number | null;
  onSelectSubject: (id: number) => void;
  selectedYear: number;
  onSelectYear: (year: number) => void;
  years: number[];
}

export default function SubjectSelector({
  subjects,
  selectedSubjectId,
  onSelectSubject,
  selectedYear,
  onSelectYear,
  years,
}: SubjectSelectorProps) {
  return (
    <aside className="w-70 flex-shrink-0">
      <div className="bg-white border border-[#dedee8] rounded-xl h-full min-h-[37.5rem] overflow-hidden flex flex-col">
        {/* Periodo Header */}
        <div className="px-5 py-4 border-b border-[#dedee8]">
          <h2 className="font-semibold text-sm leading-relaxed text-[#232334] mb-3">
            Periodo
          </h2>
          <select
            value={selectedYear}
            onChange={(e) => onSelectYear(Number(e.target.value))}
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
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => onSelectSubject(subject.id)}
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
  );
}