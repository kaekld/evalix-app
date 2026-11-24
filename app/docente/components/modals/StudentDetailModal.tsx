"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Mail, User, Calendar, BookOpen, Clock, AlertCircle, CheckCircle, Search, ChevronDown } from "lucide-react";

interface Grupo {
  id: string;
  nombre: string;
  codigo: string;
}

interface AlumnoInfo {
  id: string;
  matricula: string;
  nombre_completo: string;
  correo: string;
  activo: boolean;
  grupos: Grupo[];
}

interface Evaluacion {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  tiempo_examen: number;
  orden_aleatorio: boolean;
  creado_en: string;
  grupo_id: string;
  grupo_nombre: string;
  grupo_codigo: string;
  total_preguntas: number;
}

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  alumnoId: string;
  alumnoInfo: AlumnoInfo;
}

interface EvaluacionesResponse {
  evaluaciones: Evaluacion[];
  total: number;
}

export default function StudentDetailModal({ isOpen, onClose, alumnoId, alumnoInfo }: StudentDetailModalProps) {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [materiaFilter, setMateriaFilter] = useState("");
  const [materias, setMaterias] = useState<string[]>([]);
  const [showMateriaDropdown, setShowMateriaDropdown] = useState(false);

  const fetchEvaluaciones = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (materiaFilter) params.set('materia', materiaFilter);
      
      const res = await fetch(`/api/docente/alumnos/${alumnoId}/evaluaciones?${params.toString()}`);
      if (!res.ok) throw new Error("Error al cargar evaluaciones");
      const data: EvaluacionesResponse = await res.json();
      setEvaluaciones(data.evaluaciones);
      
      // Extract unique materias from group names and evaluation titles
      const uniqueMaterias = new Set<string>();
      data.evaluaciones.forEach((e: Evaluacion) => {
        if (e.grupo_nombre) uniqueMaterias.add(e.grupo_nombre);
        // Also extract from title if it looks like a subject
        const titleWords = e.titulo.split(' ');
        if (titleWords.length > 1) uniqueMaterias.add(titleWords[0]);
      });
      setMaterias(Array.from(uniqueMaterias).sort());
    } catch {
      // Error handled in UI
    } finally {
      setLoading(false);
    }
  }, [alumnoId, materiaFilter]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      void fetchEvaluaciones();
    }
  }, [isOpen]);

  const handleMateriaChange = (materia: string) => {
    setMateriaFilter(materia);
    setShowMateriaDropdown(false);
  };

  const clearMateriaFilter = () => {
    setMateriaFilter("");
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'PROGRAMADA':
        return { label: 'Programada', className: 'bg-[#eef2ff] text-[#4338ca]' };
      case 'EN_CURSO':
        return { label: 'En curso', className: 'bg-[#fef3c7] text-[#b45309]' };
      case 'FINALIZADA':
        return { label: 'Finalizada', className: 'bg-[#e5f2e8] text-[#336647]' };
      case 'CANCELADA':
        return { label: 'Cancelada', className: 'bg-[#fef2f2] text-[#ad3040]' };
      default:
        return { label: estado, className: 'bg-[#f1f1f1] text-[#666]' };
    }
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("es-ES", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#dedee8]">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Detalle del alumno</h2>
            <p className="text-sm text-zinc-500">{alumnoInfo.matricula} • {alumnoInfo.nombre_completo}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#f1f1f1] transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Student Info Card */}
          <div className="bg-[#fafafa] border border-[#dedee8] rounded-xl p-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-[#f0eafb] flex items-center justify-center flex-shrink-0">
                <User className="h-8 w-8 text-[#6543ab]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-zinc-900 truncate">{alumnoInfo.nombre_completo}</h3>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-zinc-700">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4 text-zinc-400" />
                    <span className="font-mono">{alumnoInfo.matricula}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-zinc-400" />
                    <span className="truncate max-w-xs">{alumnoInfo.correo}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {alumnoInfo.activo ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#e5f2e8] text-[#336647]">
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#fef2f2] text-[#ad3040]">
                      Inactivo
                    </span>
                  )}
                  {alumnoInfo.grupos.length > 0 && (
                    <span className="text-xs text-zinc-500">{alumnoInfo.grupos.length} grupo(s)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Grupos */}
            {alumnoInfo.grupos.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#dedee8]">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Grupos inscritos</p>
                <div className="flex flex-wrap gap-2">
                  {alumnoInfo.grupos.map((g) => (
                    <span key={g.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-[#dedee8] text-zinc-700">
                      <BookOpen className="h-3 w-3" />
                      {g.nombre} ({g.codigo})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Evaluaciones Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <div className="relative">
                <button
                  onClick={() => setShowMateriaDropdown(!showMateriaDropdown)}
                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-[#dedee8] focus:outline-none focus:ring-2 focus:ring-[#6543ab]/20 focus:border-[#6543ab] transition-colors bg-white text-left appearance-none"
                >
                  <span className="text-sm text-zinc-700">
                    {materiaFilter ? materiaFilter : 'Filtrar por materia / grupo'}
                  </span>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                </button>
                {showMateriaDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-[#dedee8] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    <button
                      onClick={clearMateriaFilter}
                      className={`w-full px-4 py-2 text-left text-sm ${materiaFilter === '' ? 'bg-[#f0eafb] text-[#6543ab]' : 'text-zinc-700 hover:bg-[#f6f6fa]'} transition-colors`}
                    >
                      Todas las materias
                    </button>
                    {materias.map((m) => (
                      <button
                        key={m}
                        onClick={() => handleMateriaChange(m)}
                        className={`w-full px-4 py-2 text-left text-sm ${materiaFilter === m ? 'bg-[#f0eafb] text-[#6543ab]' : 'text-zinc-700 hover:bg-[#f6f6fa]'} transition-colors`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {materiaFilter && (
              <button
                onClick={clearMateriaFilter}
                className="flex items-center gap-1 px-3 py-2 text-sm text-zinc-600 hover:text-[#ad3040] hover:bg-[#fef2f2] rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
                Limpiar filtro
              </button>
            )}
          </div>

          {/* Evaluaciones List */}
          <div className="bg-white border border-[#dedee8] rounded-xl overflow-hidden">
            {loading && evaluaciones.length === 0 ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#e0e0e0]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-[#e0e0e0] rounded w-1/3" />
                      <div className="h-3 bg-[#e0e0e0] rounded w-1/4" />
                    </div>
                    <div className="w-24 h-8 rounded bg-[#e0e0e0]" />
                  </div>
                ))}
              </div>
            ) : evaluaciones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <BookOpen className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg">No hay evaluaciones</p>
                <p className="text-sm">
                  {materiaFilter
                    ? `No hay evaluaciones para "${materiaFilter}"`
                    : 'Este alumno no tiene evaluaciones asignadas en sus grupos'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#dedee8]">
                {evaluaciones.map((ev) => (
                  <div key={ev.id} className="p-4 hover:bg-[#f6f6fa] transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-sm text-zinc-900 truncate">{ev.titulo}</h4>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoBadge(ev.estado).className}`}>
                            {getEstadoBadge(ev.estado).label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {ev.grupo_nombre} ({ev.grupo_codigo})
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {ev.tiempo_examen} min
                          </span>
                          <span className="flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {ev.total_preguntas} preguntas
                          </span>
                        </div>
                        {ev.descripcion && (
                          <p className="mt-2 text-xs text-zinc-600 line-clamp-2">{ev.descripcion}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 text-xs text-zinc-500 sm:items-end">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Inicio: {formatDateTime(ev.fecha_inicio)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Fin: {formatDateTime(ev.fecha_fin)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Creada: {formatDate(ev.creado_en)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}