export interface Subject {
  id: number;
  name: string;
  code: string;
}

export interface Exam {
  id: number;
  unit: string;
  date: string;
  time?: string;
  status: "pending" | "cancelled" | "completed";
  subjectId: number;
}

export const subjectsData: Subject[] = [
  { id: 1, name: "Programación Orientada a Objetos", code: "POO-101" },
  { id: 2, name: "Sistemas Programables", code: "SP-201" },
  { id: 3, name: "Arquitectura de Computadoras", code: "AC-301" },
];

export const examsData: Exam[] = [
  // Programación Orientada a Objetos (id: 1)
  { id: 1, unit: "Unidad 1", date: "12 NOV 2026", time: "10:00 h", status: "completed", subjectId: 1 },
  { id: 2, unit: "Unidad 2", date: "25 NOV 2026", time: "10:00 h", status: "pending", subjectId: 1 },
  { id: 3, unit: "Unidad 3", date: "10 DIC 2026", time: "10:00 h", status: "pending", subjectId: 1 },
  { id: 4, unit: "Unidad 4", date: "05 ENE 2027", time: "10:00 h", status: "cancelled", subjectId: 1 },

  // Sistemas Programables (id: 2)
  { id: 5, unit: "Unidad 1", date: "15 NOV 2026", time: "11:00 h", status: "completed", subjectId: 2 },
  { id: 6, unit: "Unidad 2", date: "28 NOV 2026", time: "11:00 h", status: "pending", subjectId: 2 },
  { id: 7, unit: "Unidad 3", date: "12 DIC 2026", time: "11:00 h", status: "cancelled", subjectId: 2 },

  // Arquitectura de Computadoras (id: 3)
  { id: 8, unit: "Unidad 1", date: "18 NOV 2026", time: "09:00 h", status: "completed", subjectId: 3 },
  { id: 9, unit: "Unidad 2", date: "02 DIC 2026", time: "09:00 h", status: "pending", subjectId: 3 },
  { id: 10, unit: "Unidad 3", date: "15 DIC 2026", time: "09:00 h", status: "pending", subjectId: 3 },
  { id: 11, unit: "Unidad 4", date: "08 ENE 2027", time: "09:00 h", status: "cancelled", subjectId: 3 },
];

export const years = [2026, 2025, 2024, 2023];

export const getStatusStyles = (status: Exam["status"]) => {
  switch (status) {
    case "pending":
      return {
        bg: "bg-[#f0eafb]",
        badgeBg: "bg-white",
        badgeText: "text-[#6543ab]",
        badgeLabel: "Pendiente",
        datePrefix: "",
      };
    case "cancelled":
      return {
        bg: "bg-[#fef2f2]",
        badgeBg: "bg-white",
        badgeText: "text-[#cc3333]",
        badgeLabel: "Cancelado",
        datePrefix: "",
      };
    case "completed":
      return {
        bg: "bg-[#f6f6fa]",
        badgeBg: "bg-[#e5f2e8]",
        badgeText: "text-[#336647]",
        badgeLabel: "Realizado",
        datePrefix: "Examen realizado · ",
      };
  }
};

export const getSortedExams = (exams: Exam[]) => {
  return [...exams].sort((a, b) => {
    // Completed first, then pending, then cancelled
    const statusOrder = { completed: 0, pending: 1, cancelled: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    // For same status, most recent first
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};