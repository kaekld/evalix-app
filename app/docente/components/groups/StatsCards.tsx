"use client";

import { Users, FileText, Clock } from "lucide-react";

interface Group {
  id: number;
  name: string;
  code: string;
  subject: string;
  schedule: string;
  studentsCount: number;
  examsCount: number;
  createdAt: string;
  expanded: boolean;
}

interface StatsCardsProps {
  groups: Group[];
}

export default function StatsCards({ groups }: StatsCardsProps) {
  const stats = [
    {
      label: "Total Grupos",
      value: groups.length,
      icon: Users,
      iconColor: "text-[#6543ab]",
      bgColor: "bg-[#f0eafb]",
    },
    {
      label: "Total Estudiantes",
      value: groups.reduce((acc, g) => acc + g.studentsCount, 0),
      icon: Users,
      iconColor: "text-[#336647]",
      bgColor: "bg-[#e5f2e8]",
    },
    {
      label: "Evaluaciones Totales",
      value: groups.reduce((acc, g) => acc + g.examsCount, 0),
      icon: FileText,
      iconColor: "text-[#b45309]",
      bgColor: "bg-[#fef3c7]",
    },
    {
      label: "Materias Activas",
      value: new Set(groups.map(g => g.subject)).size,
      icon: Clock,
      iconColor: "text-[#44689e]",
      bgColor: "bg-[#e4f7fb]",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white border border-[#dedee8] rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-normal text-xs leading-relaxed text-[#747487]">{stat.label}</p>
              <p className="font-bold text-3xl leading-relaxed text-[#232334] mt-1">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}