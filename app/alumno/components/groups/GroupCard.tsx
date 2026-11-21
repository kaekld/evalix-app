"use client";

import { useState } from "react";

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

interface GroupCardProps {
  group: Group;
  onToggle: (groupId: number) => void;
  getSortedExams: (exams: Exam[]) => Exam[];
}

export default function GroupCard({ group, onToggle, getSortedExams }: GroupCardProps) {
  const sortedExams = getSortedExams(group.exams);

  return (
    <div
      key={group.id}
      className="bg-white border border-[#dedee8] rounded-xl overflow-hidden"
    >
      {/* Group Header - clickable */}
      <button
        onClick={() => onToggle(group.id)}
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
}