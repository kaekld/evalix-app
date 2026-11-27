export interface Subject {
  id: number;
  name: string;
  code: string;
  categoria?: string;
}

export interface Evaluacion {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  tiempo_examen: number;
  orden_aleatorio: boolean;
}

export interface Intento {
  id: string;
  estado: string;
  iniciado_en: string;
  completado_en: string | null;
  finalizado_en?: string | null;
}

export interface EvaluacionWithIntento {
  id: string;
  unit: string;
  date: string;
  time?: string;
  status: "pending" | "cancelled" | "completed";
  evaluacion: Evaluacion;
  intento: Intento | null;
}

export const years = [2026, 2025, 2024, 2023];