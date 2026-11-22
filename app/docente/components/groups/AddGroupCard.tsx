"use client";

import { Plus } from "lucide-react";

interface AddGroupCardProps {
  onClick: () => void;
}

export default function AddGroupCard({ onClick }: AddGroupCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white border-2 border-dashed border-[#dedee8] rounded-xl p-6 text-center hover:border-[#6543ab] hover:bg-[#fafafa] transition-colors flex flex-col items-center justify-between min-h-[10rem]"
    >
      <div className="flex flex-col items-center flex-1">
        <div className="w-14 h-14 rounded-full bg-[#f0eafb] flex items-center justify-center mb-4">
          <Plus className="h-7 w-7 text-[#6543ab]" />
        </div>
        <h3 className="font-semibold text-base text-zinc-900 mb-1">Nuevo grupo</h3>
        <p className="text-xs text-zinc-500">Añade una nueva materia y grupo</p>
      </div>
    </button>
  );
}
