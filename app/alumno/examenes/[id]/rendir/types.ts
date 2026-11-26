export interface Pregunta {
  id: string;
  tipo: "cerrada" | "abierta_texto" | "abierta_codigo";
  enunciado: string;
  imagen_url: string | null;
  tiempo_segundos: number;
  orden: number;
  opciones: Opcion[];
}

export interface Opcion {
  id: string;
  texto: string;
  orden: number;
}

export interface Intento {
  id: string;
  estado: "en_curso" | "completado" | "incidencia" | "cancelado";
  pregunta_actual_idx: number;
  respuestas: Record<string, RespuestaGuardada>;
  iniciado_en: string;
}

export interface RespuestaGuardada {
  respuesta: string;
  tiempo_segundos: number;
  eventos: TelemetryEvent[];
  respondida_en: string;
  auto_calificada?: boolean;
  correcta?: boolean;
}

export interface EvaluacionRendir {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  tiempo_examen: number;
  orden_aleatorio: boolean;
  grupo_id: string;
  grupo_nombre: string;
}

export interface IniciarResponse {
  intento: Intento;
  evaluacion: EvaluacionRendir;
  preguntas: Pregunta[];
  tiempo_restante_segundos: number;
  tiempo_total_segundos: number;
}

export interface TelemetryEvent {
  type: 
    | "focus_lost" 
    | "paste" 
    | "typing_anomaly" 
    | "fullscreen_exit" 
    | "connection_lost" 
    | "tab_switch" 
    | "copy_attempt" 
    | "right_click" 
    | "devtools_open" 
    | "screenshot_attempt" 
    | "network_error";
  timestamp: string;
  pregunta_id: string;
  data?: Record<string, any>;
}

export interface FinalizarResponse {
  ok: boolean;
  auto_calificadas: number;
  total_cerradas: number;
  tiempo_total_segundos: number;
}