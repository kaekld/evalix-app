"use client";

import { useEffect, useState } from "react";
import { Modal, ModalFooter } from "@/components/ui";
import { Button } from "@/components/ui";

interface ExamStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: {
    id: string;
    titulo: string;
    descripcion: string | null;
    fecha_inicio: string;
    fecha_fin: string;
    tiempo_examen: number;
    orden_aleatorio: boolean;
  };
  onStart: (evaluacionId: string) => void;
}

export default function ExamStartModal({
  isOpen,
  onClose,
  exam,
  onStart,
}: ExamStartModalProps) {
  const [puedeEmpezar, setPuedeEmpezar] = useState(false);
  const [minutosRestantes, setMinutosRestantes] = useState(0);
  const [serverTimeDiff, setServerTimeDiff] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !exam) return;

    const checkTime = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.server_time) {
            setServerTimeDiff(new Date(data.server_time).getTime() - Date.now());
          }
        }
      } catch {
      } finally {
        setLoading(false);
      }

      const now = Date.now() + serverTimeDiff;
      const inicio = new Date(exam.fecha_inicio).getTime();
      const fin = new Date(exam.fecha_fin).getTime();

      if (now >= inicio && now <= fin) {
        setPuedeEmpezar(true);
        setMinutosRestantes(0);
      } else if (now < inicio) {
        setPuedeEmpezar(false);
        setMinutosRestantes(Math.ceil((inicio - now) / 60000));
      } else {
        setPuedeEmpezar(false);
        setMinutosRestantes(0);
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 30000);
    return () => clearInterval(interval);
  }, [isOpen, exam, serverTimeDiff]);

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Iniciar evaluación"
      description={exam.titulo}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={() => onStart(exam.id)}
            disabled={!puedeEmpezar || loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verificando...
              </span>
            ) : puedeEmpezar ? (
              "Empezar a contestar"
            ) : "No disponible aún"}
          </Button>
        </div>
      }
    >
      <div className="px-6 pb-6 space-y-5">
        {exam.descripcion && (
          <div className="bg-[var(--color-background)] rounded-lg p-4 border border-[#dedee8]">
            <p className="font-normal text-sm text-[#747487]">{exam.descripcion}</p>
          </div>
        )}

        <div className="bg-[var(--color-background)] rounded-lg p-4 space-y-3 border border-[#dedee8]">
          <h4 className="font-semibold text-sm text-[#232334]">Detalles de la evaluación</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[#747487]">Inicio</p>
              <p className="font-medium text-[#232334]">{formatDateTime(exam.fecha_inicio)}</p>
            </div>
            <div>
              <p className="text-[#747487]">Fin</p>
              <p className="font-medium text-[#232334]">{formatDateTime(exam.fecha_fin)}</p>
            </div>
            <div>
              <p className="text-[#747487]">Duración</p>
              <p className="font-medium text-[#232334]">{exam.tiempo_examen} minutos</p>
            </div>
            <div>
              <p className="text-[#747487]">Orden de preguntas</p>
              <p className="font-medium text-[#232334]">{exam.orden_aleatorio ? "Aleatorio" : "Secuencial"}</p>
            </div>
          </div>
        </div>

        <div className={`flex items-center justify-center gap-3 p-4 rounded-lg border transition-colors
          ${puedeEmpezar
            ? "bg-[#e5f2e8] border-[#336647]"
            : minutosRestantes > 0
            ? "bg-[#fff8e1] border-[#ffd54f]"
            : "bg-[#fef2f2] border-[#ef9a9a]"}`}>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[#747487]">
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Verificando disponibilidad...
            </div>
          ) : puedeEmpezar ? (
            <div className="flex items-center gap-2 text-sm text-[#336647]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">La evaluación está disponible ahora</span>
            </div>
          ) : minutosRestantes > 0 ? (
            <div className="flex items-center gap-2 text-sm text-[#f57f17]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">
                Disponible en {minutosRestantes} minuto{minutosRestantes > 1 ? "s" : ""}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-[#cc3333]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium">La evaluación ha finalizado</span>
            </div>
          )}
        </div>

        <div className="bg-[#fef2f2] border border-[#ef9a9a] rounded-lg p-4">
          <h4 className="font-semibold text-sm text-[#cc3333] mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Reglas importantes
          </h4>
          <ul className="text-sm text-[#cc3333] space-y-1 list-disc list-inside">
            <li>Una vez que inicies, el cronómetro comienza y no se detiene.</li>
            <li>No podrás volver a preguntas anteriores después de avanzar.</li>
            <li>Cambiar de pestaña o ventana puede cancelar tu examen.</li>
            <li>Si pierdes conexión, el examen se cancelará automáticamente.</li>
            <li>Asegúrate de usar una computadora de escritorio o laptop.</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}