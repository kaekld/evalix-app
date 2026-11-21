"use client";

interface UpcomingExamCardProps {
  subject: string;
  unit: string;
  questionCount: number;
  onEnter: () => void;
}

export default function UpcomingExamCard({ subject, unit, questionCount, onEnter }: UpcomingExamCardProps) {
  return (
    <section>
      <h2 className="font-semibold text-sm leading-relaxed text-[#232334] mb-4">
        Examen por Empezar
      </h2>
      <div className="bg-[#e4f7fb] rounded-xl p-6 max-w-3xl min-h-[9.5rem]">
        <p className="font-semibold text-2xl leading-relaxed text-[#232334] mb-2">
          {subject}
        </p>
        <p className="font-normal text-sm leading-relaxed text-black mb-6">
          {unit} · {questionCount} preguntas
        </p>
        <button
          onClick={onEnter}
          className="flex items-center justify-center px-4 h-10 rounded-lg bg-[#44689e] font-semibold text-sm leading-relaxed text-white w-[9.4375rem] hover:bg-[#3a5a8a] transition-colors"
        >
          Entrar a examen
        </button>
      </div>
    </section>
  );
}