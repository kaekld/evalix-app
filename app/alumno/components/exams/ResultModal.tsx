"use client";

import { Modal, ModalFooter } from "@/components/ui";
import { Button } from "@/components/ui";
import { EvaluacionWithIntento } from "./types";

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: EvaluacionWithIntento;
}

export default function ResultModal({
  isOpen,
  onClose,
  exam,
}: ResultModalProps) {
  const { evaluacion, intento } = exam;

  const formatDateTime = (iso: string | null | undefined) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Resultado de evaluación"
      description={evaluacion.titulo}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      }
    >
      <div className="px-6 pb-6 space-y-5 max-h-[60vh] overflow-y-auto">
        {evaluacion.descripcion && (
          <div className="bg-[var(--color-background)] rounded-lg p-4 border border-[#dedee8]">
            <p className="font-normal text-sm text-[#747487]">{evaluacion.descripcion}</p>
          </div>
        )}

        <div className="bg-white border border-[#dedee8] rounded-xl p-5 space-y-4">
          <h4 className="font-semibold text-base text-[#232334] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#336647]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Información del intento
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-[#f6f6fa] rounded-lg p-4">
              <p className="text-[#747487] mb-1">Estado</p>
              <p className="font-semibold text-[#336647">Completado</p>
            </div>
            <div className="bg-[#f6f6fa] rounded-lg p-4">
              <p className="text-[#747487] mb-1">Iniciado</p>
              <p className="font-medium text-[#232334]">{formatDateTime(intento?.iniciado_en)}</p>
            </div>
            <div className="bg-[#f6f6fa] rounded-lg p-4">
              <p className="text-[#747487] mb-1">Finalizado</p>
              <p className="font-medium text-[#232334]">{formatDateTime(intento?.completado_en)}</p>
            </div>
            <div className="bg-[#f6f6fa] rounded-lg p-4">
              <p className="text-[#747487] mb-1">Duración configurada</p>
              <p className="font-medium text-[#232334]">{evaluacion.tiempo_examen} minutos</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#dedee8] rounded-xl p-5 space-y-4">
          <h4 className="font-semibold text-base text-[#232334] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#6543ab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Detalles de la evaluación
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#747487] mb-1">Período</p>
              <p className="font-medium text-[#232334]">
                {formatDate(evaluacion.fecha_inicio)} - {formatDate(evaluacion.fecha_fin)}
              </p>
            </div>
            <div>
              <p className="text-[#747487] mb-1">Tipo de orden</p>
              <p className="font-medium text-[#232334]">{evaluacion.orden_aleatorio ? "Aleatorio" : "Secuencial"}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#e5f2e8] border border-[#336647] rounded-xl p-5">
          <h4 className="font-semibold text-base text-[#336647] mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Calificación
          </h4>
          <p className="text-sm text-[#336647]">
            La calificación de esta evaluación estará disponible una vez que el docente complete la revisión manual de las preguntas abiertas.
            Podrás consultar tu nota y el desglose por pregunta desde esta misma pantalla cuando esté lista.
          </p>
        </div>
      </div>
    </Modal>
  );
}