"use client";

import Link from "next/link";
import { Evaluacion, getEvaluacionStatusStyles, getSortedEvaluaciones } from "./types";

interface EvaluacionSectionProps {
  title: string;
  evaluaciones: Evaluacion[];
  emptyMessage: string;
}

export default function EvaluacionSection({
  title,
  evaluaciones,
  emptyMessage,
}: EvaluacionSectionProps) {
  const sortedEvaluaciones = getSortedEvaluaciones(evaluaciones);

  return (
    <section className="space-y-4">
      <h3 className="font-semibold text-sm leading-relaxed text-[#232334]">
        {title} ({evaluaciones.length})
      </h3>
      {sortedEvaluaciones.length === 0 ? (
        <div className="bg-white border border-[#dedee8] rounded-xl p-8 text-center">
          <p className="font-normal text-sm leading-normal text-[#747487]">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedEvaluaciones.map((evaluacion) => {
            const styles = getEvaluacionStatusStyles(evaluacion.status);
            return (
              <Link
                key={evaluacion.id}
                href={`/docente/evaluaciones/${evaluacion.id}`}
                className="block"
              >
                <div className={`rounded-lg p-4 ${styles.bg} border border-[#dedee8] transition-shadow hover:shadow-md hover:border-[#6543ab]`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base leading-normal text-[#232334]">
                        {evaluacion.titulo}
                      </p>
                      <p className="font-normal text-xs leading-normal text-[#747487] mt-0.5">
                        {styles.datePrefix}{evaluacion.fecha}{evaluacion.hora ? ` · ${evaluacion.hora}` : ""}
                        {evaluacion.grupoNombre && ` · ${evaluacion.grupoNombre}`}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center justify-center px-3 h-7 rounded-full ${styles.badgeBg} font-semibold text-xs leading-normal ${styles.badgeText}`}>
                        {styles.badgeLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}