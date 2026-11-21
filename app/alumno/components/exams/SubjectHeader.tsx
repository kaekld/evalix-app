"use client";

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface SubjectHeaderProps {
  subject: Subject | undefined;
  completedCount: number;
  pendingCount: number;
  cancelledCount: number;
}

export default function SubjectHeader({
  subject,
  completedCount,
  pendingCount,
  cancelledCount,
}: SubjectHeaderProps) {
  if (!subject) return null;

  return (
    <div className="bg-white border border-[#dedee8] rounded-xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-xl leading-relaxed text-[#232334]">
            {subject.name}
          </p>
          <p className="font-normal text-sm leading-relaxed text-[#747487] mt-1">
            {subject.code}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#747487]">
          <span className="font-medium text-[#336647]">{completedCount} realizados</span>
          <span className="font-medium text-[#6543ab]">{pendingCount} pendientes</span>
          <span className="font-medium text-[#cc3333]">{cancelledCount} cancelados</span>
        </div>
      </div>
    </div>
  );
}