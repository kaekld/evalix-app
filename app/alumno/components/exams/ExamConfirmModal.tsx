"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal, ModalHeader, ModalFooter } from "@/components/ui";
import { Button } from "@/components/ui";

interface ExamConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: {
    titulo: string;
    fecha_inicio: string;
    fecha_fin: string;
    tiempo_examen: number;
  };
  onConfirm: () => void;
}

const warnings = [
  "No cambies de pestaña o ventana durante la evaluación",
  "No copies ni pegues contenido externo",
  "No uses herramientas de IA o asistencia externa",
  "La evaluación se cancela automáticamente si pierdes conexión a internet",
  "Una vez que avances de pregunta, no podrás editar respuestas anteriores",
];

export default function ExamConfirmModal({
  isOpen,
  onClose,
  exam,
  onConfirm,
}: ExamConfirmModalProps) {
  const [accepted, setAccepted] = useState(false);

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
    <Modal isOpen={isOpen} onClose={onClose} size="md" title="Confirmar inicio de evaluación">
      <ModalHeader
        title="Confirmar inicio de evaluación"
        description={exam.titulo}
        onClose={onClose}
      />
      <div className="space-y-4 px-6 pb-6 max-h-[60vh] overflow-y-auto">
        <div className="bg-[var(--color-background)] rounded-lg p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-secondary)]">Inicio</span>
            <span className="font-medium">{formatDateTime(exam.fecha_inicio)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-secondary)]">Fin</span>
            <span className="font-medium">{formatDateTime(exam.fecha_fin)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-secondary)]">Duración</span>
            <span className="font-medium">{exam.tiempo_examen} minutos</span>
          </div>
        </div>

        <div className="bg-[var(--color-warning-bg)] border border-[var(--color-warning)] rounded-lg p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-[var(--color-text-primary)] mb-3">
                Reglas importantes durante la evaluación:
              </p>
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                {warnings.map((warning, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-[var(--color-warning)] flex-shrink-0">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          />
          <span className="text-sm text-[var(--color-text-secondary)]">
            He leído y acepto las condiciones arriba mencionadas
          </span>
        </label>
      </div>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          disabled={!accepted}
          className="w-full sm:w-auto"
        >
          Comenzar a contestar
        </Button>
      </ModalFooter>
    </Modal>
  );
}