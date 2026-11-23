"use client";

interface EvaluacionHeaderProps {
  grupoNombre: string | null;
  pendientesCount: number;
  publicadasCount: number;
  finalizadasCount: number;
}

export default function EvaluacionHeader({
  grupoNombre,
  pendientesCount,
  publicadasCount,
  finalizadasCount,
}: EvaluacionHeaderProps) {
  return (
    <div className="bg-white border border-[#dedee8] rounded-xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-xl leading-relaxed text-[#232334]">
            {grupoNombre || "Todas las evaluaciones"}
          </p>
          {grupoNombre && (
            <p className="font-normal text-sm leading-relaxed text-[#747487] mt-1">
              Evaluaciones de este grupo
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-[#747487]">
          <span className="font-medium text-[#6543ab]">{pendientesCount} pendientes</span>
          <span className="font-medium text-[#0369a1]">{publicadasCount} publicadas</span>
          <span className="font-medium text-[#336647]">{finalizadasCount} finalizadas</span>
        </div>
      </div>
    </div>
  );
}