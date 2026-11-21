"use client";

import { Plus } from "lucide-react";

interface EmptyStateProps {
  onCreateClick: () => void;
}

export default function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="col-span-full">
      <div className="bg-white border-2 border-dashed border-[#dedee8] rounded-xl p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-[#f0eafb] flex items-center justify-center mx-auto mb-4">
          <Plus className="h-8 w-8 text-[#6543ab]" />
        </div>
        <h3 className="font-semibold text-lg text-zinc-900 mb-2">No tienes grupos aún</h3>
        <p className="text-zinc-500 mb-6 max-w-md mx-auto">
          Crea tu primer grupo para empezar a gestionar tus estudiantes y evaluaciones.
        </p>
        <button
          onClick={onCreateClick}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[#6543AB] font-semibold text-sm leading-relaxed text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Crear mi primer grupo
        </button>
      </div>
    </div>
  );
}