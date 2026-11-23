"use client";

import { Button } from "@/components/ui";

interface UpcomingExamCardProps {
  subject: string;
  unit: string;
  questionCount: number;
  onEnter: () => void;
}

export default function UpcomingExamCard({ subject, unit, questionCount, onEnter }: UpcomingExamCardProps) {
  return (
    <section>
      <h2 className="font-semibold text-sm leading-relaxed text-[var(--color-text-primary)] mb-4">
        Examen por Empezar
      </h2>
      <div className="bg-[var(--color-exam-card-bg)] rounded-xl p-6 max-w-3xl min-h-[9.5rem]">
        <p className="font-semibold text-2xl leading-relaxed text-[var(--color-text-primary)] mb-2">
          {subject}
        </p>
        <p className="font-normal text-sm leading-relaxed text-black mb-6">
          {unit} · {questionCount} preguntas
        </p>
        <Button onClick={onEnter} className="w-[9.4375rem]">
          Entrar a examen
        </Button>
      </div>
    </section>
  );
}