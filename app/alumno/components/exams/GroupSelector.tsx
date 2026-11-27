"use client";

import { useMemo } from "react";
import { AlumnoGrupo } from "@/lib/hooks/useAlumnoGrupos";

interface ExamSummary {
  id: string;
  titulo: string;
  fecha_inicio: string;
  estado: 'programada' | 'publicada' | 'en_curso' | 'finalizada' | 'cancelada';
}

interface GroupWithExams extends AlumnoGrupo {
  examSummaries: ExamSummary[];
}

interface GroupSelectorProps {
  groups: GroupWithExams[];
  selectedGroupId: string | null;
  onSelectGroup: (id: string) => void;
  selectedYear: number;
  onSelectYear: (year: number) => void;
  years: number[];
}

export default function GroupSelector({
  groups,
  selectedGroupId,
  onSelectGroup,
  selectedYear,
  onSelectYear,
  years,
}: GroupSelectorProps) {
  const counts = useMemo(() => {
    const pending: Record<string, number> = {};
    const inProgress: Record<string, number> = {};
    const completed: Record<string, number> = {};
    const cancelled: Record<string, number> = {};

    groups.forEach((group) => {
      const exams = group.examenes || [];
      pending[group.id] = exams.filter(e => e.estado === 'programada' || e.estado === 'publicada').length;
      inProgress[group.id] = exams.filter(e => e.estado === 'en_curso').length;
      completed[group.id] = exams.filter(e => e.estado === 'finalizada').length;
      cancelled[group.id] = exams.filter(e => e.estado === 'cancelada').length;
    });

    return { pending, inProgress, completed, cancelled };
  }, [groups]);

  return (
    <aside className="w-72 flex-shrink-0" aria-label="Grupos y periodo">
      <div className="bg-white border border-[#dedee8] rounded-xl h-full min-h-[37.5rem] overflow-hidden flex flex-col">
        {/* Periodo Header */}
        <div className="px-5 py-4 border-b border-[#dedee8]">
          <h2 className="font-semibold text-sm leading-relaxed text-[#232334] mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#747487]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Periodo académico
          </h2>
          <select
            value={selectedYear}
            onChange={(e) => onSelectYear(Number(e.target.value))}
            className="w-full px-3 py-2 border border-[#dedee8] rounded-lg text-sm font-medium text-[#232334] bg-white focus:outline-none focus:ring-2 focus:ring-[#6543ab] focus:border-transparent appearance-none cursor-pointer"
            aria-label="Seleccionar año académico"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Grupos List */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="font-semibold text-xs leading-relaxed text-[#747487] mb-3 uppercase tracking-wide flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Mis grupos
          </p>
          <div className="space-y-2">
            {groups.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-[#dedee8] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="font-normal text-sm leading-normal text-[#747487]">
                  No estás inscrito en ningún grupo
                </p>
              </div>
            ) : (
              groups.map((group) => {
                const isSelected = selectedGroupId === group.id;
                const pending = counts.pending[group.id] || 0;
                const inProgress = counts.inProgress[group.id] || 0;
                const completed = counts.completed[group.id] || 0;
                const cancelled = counts.cancelled[group.id] || 0;
                const total = pending + inProgress + completed + cancelled;

                return (
                  <button
                    key={group.id}
                    onClick={() => onSelectGroup(group.id)}
                    className={`w-full px-4 py-4 rounded-xl text-left transition-all duration-200 ${
                      isSelected
                        ? "bg-[#f0eafb] border-2 border-[#6543ab] shadow-sm"
                        : "border border-transparent hover:bg-[#f6f6fa] hover:border-[#dedee8]"
                    }`}
                    aria-pressed={isSelected}
                    aria-label={`${group.nombre}, ${group.codigo}, ${total} evaluaciones`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "bg-[#6543ab] text-white" : "bg-[#f6f6fa] text-[#747487]"
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm leading-relaxed truncate ${
                          isSelected ? "text-[#6543ab]" : "text-[#232334]"
                        }`}>
                          {group.nombre}
                        </p>
                        <p className={`font-normal text-xs leading-relaxed mt-0.5 truncate ${
                          isSelected ? "text-[#6543ab]/80" : "text-[#747487]"
                        }`}>
                          {group.codigo} · {group.categoria}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {pending > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#f0eafb] text-[#6543ab]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#6543ab] mr-1" aria-hidden="true"></span>
                              {pending} pendiente{pending > 1 ? 's' : ''}
                            </span>
                          )}
                          {inProgress > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#fff8e1] text-[#f57f17]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#f57f17] mr-1 animate-pulse" aria-hidden="true"></span>
                              {inProgress} en curso
                            </span>
                          )}
                          {completed > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#e5f2e8] text-[#336647]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#336647] mr-1" aria-hidden="true"></span>
                              {completed} realizado{completed > 1 ? 's' : ''}
                            </span>
                          )}
                          {cancelled > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#fef2f2] text-[#cc3333]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#cc3333] mr-1" aria-hidden="true"></span>
                              {cancelled} cancelado{cancelled > 1 ? 's' : ''}
                            </span>
                          )}
                          {total === 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#f6f6fa] text-[#747487]">
                              Sin evaluaciones
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <svg className="w-5 h-5 text-[#6543ab] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}