"use client";

import { EvaluacionWithIntento } from "./types";

interface ExamCardProps {
  exam: EvaluacionWithIntento;
  onClick?: () => void;
  onStart?: () => void;
  onViewResult?: () => void;
  isClickable?: boolean;
  showActions?: boolean;
}

export default function ExamCard({
  exam,
  onClick,
  onStart,
  onViewResult,
  isClickable = false,
  showActions = false,
}: ExamCardProps) {
  const { evaluacion, intento, status } = exam;
  
  const getStatusConfig = () => {
    switch (status) {
      case "pending":
        if (intento?.estado === "en_curso") {
          return {
            bg: "bg-[#fff8e1]",
            border: "border-[#ffd54f]",
            badgeBg: "bg-[#ffd54f]",
            badgeText: "text-white",
            badgeLabel: "En curso",
            iconColor: "text-[#f57f17]",
          };
        }
        if (intento?.estado === "incidencia") {
          return {
            bg: "bg-[#fef2f2]",
            border: "border-[#ef9a9a]",
            badgeBg: "bg-[#ef5350]",
            badgeText: "text-white",
            badgeLabel: "Incidencia",
            iconColor: "text-[#c62828]",
          };
        }
        return {
          bg: "bg-[#f0eafb]",
          border: "border-[#c5b3e8]",
          badgeBg: "bg-white",
          badgeText: "text-[#6543ab]",
          badgeLabel: "Pendiente",
          iconColor: "text-[#6543ab]",
        };
      case "completed":
        return {
          bg: "bg-[#f6f6fa]",
          border: "border-[#dedee8]",
          badgeBg: "bg-[#e5f2e8]",
          badgeText: "text-[#336647]",
          badgeLabel: "Realizado",
          iconColor: "text-[#336647]",
        };
      case "cancelled":
        return {
          bg: "bg-[#fef2f2]",
          border: "border-[#ef9a9a]",
          badgeBg: "bg-[#ef5350]",
          badgeText: "text-white",
          badgeLabel: "Cancelado",
          iconColor: "text-[#c62828]",
        };
    }
  };

  const config = getStatusConfig();
  const canStart = status === "pending" && !intento && onStart;
  const canContinue = status === "pending" && intento?.estado === "en_curso" && onStart;
  const canViewResult = status === "completed" && onViewResult;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <article
      className={`rounded-xl p-5 transition-all duration-200 border ${config.bg} ${config.border} ${isClickable ? "cursor-pointer hover:shadow-lg hover:-translate-y-0.5" : ""}`}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick?.(); } } : undefined}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${config.iconColor} bg-white border ${config.border}`}>
              {status === "pending" && !intento && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {intento?.estado === "en_curso" && (
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {intento?.estado === "incidencia" && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {status === "completed" && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {status === "cancelled" && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-base leading-relaxed text-[#232334] truncate">
                {evaluacion.titulo}
              </h4>
              {evaluacion.descripcion && (
                <p className="font-normal text-sm leading-relaxed text-[#747487] mt-1 line-clamp-2">
                  {evaluacion.descripcion}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#747487]">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(evaluacion.fecha_inicio)} - {formatDate(evaluacion.fecha_fin)}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatTime(evaluacion.fecha_inicio)}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {evaluacion.tiempo_examen} min
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.badgeBg} ${config.badgeText}`}>
            {config.badgeLabel}
          </span>

          {showActions && (
            <div className="flex items-center gap-2">
              {canStart && (
                <button
                  onClick={(e) => { e.stopPropagation(); onStart?.(); }}
                  className="px-4 py-2 bg-[#6543ab] text-white text-sm font-medium rounded-lg hover:bg-[#533591] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6543ab] focus:ring-offset-2"
                >
                  Empezar
                </button>
              )}
              {canContinue && (
                <button
                  onClick={(e) => { e.stopPropagation(); onStart?.(); }}
                  className="px-4 py-2 bg-[#f57f17] text-white text-sm font-medium rounded-lg hover:bg-[#ef6c00] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f57f17] focus:ring-offset-2"
                >
                  Continuar
                </button>
              )}
              {canViewResult && (
                <button
                  onClick={(e) => { e.stopPropagation(); onViewResult?.(); }}
                  className="px-4 py-2 border border-[#dedee8] text-[#232334] text-sm font-medium rounded-lg hover:bg-[#f6f6fa] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6543ab] focus:ring-offset-2"
                >
                  Ver resultado
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {intento && status === "pending" && intento.estado === "en_curso" && (
        <div className="mt-4 pt-4 border-t border-[#dedee8]">
          <div className="flex items-center gap-2 text-sm text-[#747487]">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Iniciado: {new Date(intento.iniciado_en).toLocaleString("es-ES")}
            </span>
          </div>
        </div>
      )}

      {intento && status === "completed" && (
        <div className="mt-4 pt-4 border-t border-[#dedee8]">
          <div className="flex items-center gap-2 text-sm text-[#747487]">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Completado: {intento.finalizado_en ? new Date(intento.finalizado_en).toLocaleString("es-ES") : "—"}
            </span>
          </div>
        </div>
      )}
    </article>
  );
}