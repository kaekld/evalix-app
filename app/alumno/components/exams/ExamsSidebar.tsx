"use client";

interface Exam {
  id: number;
  unit: string;
  date: string;
  time?: string;
  status: "upcoming" | "completed";
}

interface ExamsSidebarProps {
  exams: Exam[];
}

export default function ExamsSidebar({ exams }: ExamsSidebarProps) {
  const upcomingExams = exams.filter(e => e.status === "upcoming");
  const nextExam = upcomingExams[0];

  return (
    <aside className="w-64 flex-shrink-0">
      <div className="bg-white border border-[#dedee8] rounded-xl h-[26.5rem] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#dedee8]">
          <h2 className="font-semibold text-sm leading-relaxed text-[#232334]">
            Exámenes próximos
          </h2>
        </div>
        <div className="p-4">
          {nextExam ? (
            <div className="border-b border-[#dedee8] pb-4">
              <p className="font-semibold text-xs leading-relaxed text-[#747487] whitespace-pre-wrap">
                {nextExam.date} {nextExam.time ? `· ${nextExam.time}` : ""}
              </p>
              <p className="font-medium text-base leading-relaxed text-[#232334] mt-1">
                {nextExam.unit}
              </p>
            </div>
          ) : (
            <p className="font-normal text-sm leading-normal text-[#747487] text-center py-8">
              No hay exámenes próximos
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}