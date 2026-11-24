export interface Grupo {
  id: string;
  nombre: string;
  codigo: string;
}

export interface Evaluacion {
  id: string;
  titulo: string;
  fecha: string;
  hora?: string;
  status: "pendiente" | "publicada" | "finalizada";
  grupoId: string;
  grupoNombre: string;
  descripcion?: string;
  tiempoExamen?: number; // Total exam time in minutes
  ordenAleatorio?: boolean;
  preguntas?: Pregunta[];
}

export interface Pregunta {
  id: string;
  evaluacionId: string;
  tipo: "cerrada" | "abierta";
  enunciado: string;
  imagenUrl?: string;
  tiempoSegundos: number;
  orden: number;
  opciones?: Opcion[];
}

export interface Opcion {
  id: string;
  preguntaId: string;
  texto: string;
  esCorrecta: boolean;
}

// API payload types (snake_case for backend)
export interface OpcionInput {
  id: string;
  pregunta_id: string;
  texto: string;
  es_correcta: boolean;
}

export interface PreguntaInput {
  tipo: "cerrada" | "abierta";
  enunciado: string;
  imagen_url?: string;
  tiempo_segundos: number;
  orden: number;
  opciones: OpcionInput[];
}

export const statuses = [
  { value: "pendiente", label: "Pendientes" },
  { value: "publicada", label: "Publicadas" },
  { value: "finalizada", label: "Finalizadas" },
] as const;

export const getEvaluacionStatusStyles = (status: Evaluacion["status"]) => {
  switch (status) {
    case "pendiente":
      return {
        bg: "bg-[#f0eafb]",
        badgeBg: "bg-white",
        badgeText: "text-[#6543ab]",
        badgeLabel: "Pendiente",
        datePrefix: "",
      };
    case "publicada":
      return {
        bg: "bg-[#e0f2fe]",
        badgeBg: "bg-white",
        badgeText: "text-[#0369a1]",
        badgeLabel: "Publicada",
        datePrefix: "Publicada · ",
      };
    case "finalizada":
      return {
        bg: "bg-[#f6f6fa]",
        badgeBg: "bg-[#e5f2e8]",
        badgeText: "text-[#336647]",
        badgeLabel: "Finalizada",
        datePrefix: "Evaluación finalizada · ",
      };
  }
};

export const getSortedEvaluaciones = (evaluaciones: Evaluacion[]) => {
  return [...evaluaciones].sort((a, b) => {
    // Pending first, then published, then completed
    const statusOrder = { pendiente: 0, publicada: 1, finalizada: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    // For same status, most recent first
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });
};