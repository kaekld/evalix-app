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
    const completed: Record<string, number> = {};
    
    groups.forEach((group) => {
      const exams = group.examenes || [];
      pending[group.id] = exams.filter(e => e.estado === 'programada' || e.estado === 'publicada').length;
      completed[group.id] = exams.filter(e => e.estado === 'finalizada').length;
    });
    
    return { pending, completed };
  }, [groups]);

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

        {/* Grupos List */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="font-semibold text-xs leading-relaxed text-[#747487] mb-3 uppercase tracking-wide">
            Mis Grupos
          </p>
          <div className="space-y-2">
            {groups.length === 0 ? (
              <p className="font-normal text-sm leading-normal text-[#747487] text-center py-8">
                No estás inscrito en ningún grupo
              </p>
            ) : (
              groups.map((group) => {
                const isSelected = selectedGroupId === group.id;
                const pending = counts.pending[group.id] || 0;
                const completed = counts.completed[group.id] || 0;
                
                return (
                  <button
                    key={group.id}
                    onClick={() => onSelectGroup(group.id)}
                    className={`w-full px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      isSelected
                        ? "bg-[#f0eafb] border border-[#6543ab]"
                        : "border border-transparent hover:bg-[#f6f6fa] hover:border-[#dedee8]"
                    }`}
                  >
                    <p className={`font-semibold text-sm leading-relaxed truncate ${
                      isSelected ? "text-[#6543ab]" : "text-[#232334]"
                    }`}>
                      {group.nombre}
                    </p>
                    <p className={`font-normal text-xs leading-relaxed mt-1 truncate ${
                      isSelected ? "text-[#6543ab]/80" : "text-[#747487]"
                    }`}>
                      {group.codigo} · {group.categoria}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {pending > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#f0eafb] text-[#6543ab]">
                          {pending} pendiente{pending > 1 ? 's' : ''}
                        </span>
                      )}
                      {completed > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#e5f2e8] text-[#336647]">
                          {completed} realizado{completed > 1 ? 's' : ''}
                        </span>
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