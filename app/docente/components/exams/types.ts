export type EstadoExamen = "pendiente" | "publicada" | "finalizada" | "cancelada";

export type TipoPregunta = "CERRADA" | "ABIERTA";

export interface OpcionMultiple {
  id: string;
  texto: string;
  es_correcta: boolean;
  orden: number;
}

export interface Pregunta {
  id: string;
  tipo: TipoPregunta;
  enunciado: string;
  imagen_url: string | null;
  tiempo_segundos: number;
  orden: number;
  opciones: OpcionMultiple[];
}

export interface Examen {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  estado: EstadoExamen;
  tiempo_examen: number;
  orden_aleatorio: boolean;
  creado_en: string;
  actualizado_en: string;
  grupo_id: string;
  grupoNombre: string;
  grupoCodigo: string;
  preguntas: Pregunta[];
}

export interface GrupoOption {
  id: string;
  nombre: string;
  codigo: string;
}

export interface CreateExamenDTO {
  titulo: string;
  grupo_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion?: string;
  tiempo_examen?: number;
  orden_aleatorio?: boolean;
}
