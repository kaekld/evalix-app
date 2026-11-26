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