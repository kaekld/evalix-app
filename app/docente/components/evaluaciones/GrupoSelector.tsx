"use client";

import { Grupo } from "./types";

interface GrupoSelectorProps {
  grupos: Grupo[];
  selectedGrupoId: string | null;
  onSelectGrupo: (id: string) => void;
}

export default function GrupoSelector({
  grupos,
  selectedGrupoId,
  onSelectGrupo,
}: GrupoSelectorProps) {
  return (
    <aside className="w-70 flex-shrink-0">
      <div className="bg-white border border-[#dedee8] rounded-xl h-full min-h-[37.5rem] overflow-hidden flex flex-col">
        {/* Grupos List */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="font-semibold text-xs leading-relaxed text-[#747487] mb-3 uppercase tracking-wide">
            Grupos
          </p>
          <div className="space-y-2">
            <button
              onClick={() => onSelectGrupo("all")}
              className={`w-full px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                selectedGrupoId === "all" || selectedGrupoId === null
                  ? "bg-[#f0eafb] border border-[#6543ab]"
                  : "border border-transparent hover:bg-[#f6f6fa] hover:border-[#dedee8]"
              }`}
            >
              <p className={`font-semibold text-sm leading-relaxed truncate ${
                selectedGrupoId === "all" || selectedGrupoId === null
                  ? "text-[#6543ab]"
                  : "text-[#232334]"
              }`}>
                Todos los grupos
              </p>
            </button>
            {grupos.map((grupo) => (
              <button
                key={grupo.id}
                onClick={() => onSelectGrupo(grupo.id)}
                className={`w-full px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  selectedGrupoId === grupo.id
                    ? "bg-[#f0eafb] border border-[#6543ab]"
                    : "border border-transparent hover:bg-[#f6f6fa] hover:border-[#dedee8]"
                }`}
              >
                <p className={`font-semibold text-sm leading-relaxed truncate ${
                  selectedGrupoId === grupo.id
                    ? "text-[#6543ab]"
                    : "text-[#232334]"
                }`}>
                  {grupo.nombre}
                </p>
                <p className={`font-normal text-xs leading-relaxed mt-1 truncate ${
                  selectedGrupoId === grupo.id
                    ? "text-[#6543ab]/80"
                    : "text-[#747487]"
                }`}>
                  {grupo.codigo}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}