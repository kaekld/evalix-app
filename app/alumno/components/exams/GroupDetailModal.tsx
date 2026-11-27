"use client";

import { useState, useEffect } from "react";
import { X, User, Mail, Calendar, Clock, Users, FileText, CheckCircle, AlertCircle, Clock as ClockIcon, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui";
import { useGrupoDetalle } from "@/lib/hooks/useGrupoDetalle";
import { Exam } from "@/components/ui/GroupCard";

type Tab = "info" | "evaluaciones" | "alumnos";

interface GroupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  grupoId: string;
  onExamClick?: (exam: Exam) => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function getEstadoBadge(estado: string, mi_estado: string) {
  const now = new Date();
  switch (estado) {
    case "programada":
    case "publicada":
      if (mi_estado === "pending") {
        return { label: "Disponible", className: "bg-[var(--color-success-bg)] text-[var(--color-success)]", icon: CheckCircle };
      }
      return { label: "Próxima", className: "bg-[var(--color-primary-light)] text-[var(--color-primary)]", icon: ClockIcon };
    case "en_curso":
      return { label: "En curso", className: "bg-[var(--color-warning-bg)] text-[var(--color-warning)] animate-pulse", icon: AlertCircle };
    case "finalizada":
      if (mi_estado === "completed") {
        return { label: "Completada", className: "bg-[var(--color-success-bg)] text-[var(--color-success)]", icon: CheckCircle };
      }
      return { label: "Finalizada", className: "bg-[var(--color-text-muted)] text-[var(--color-text-secondary)]", icon: ClockIcon };
    case "cancelada":
      return { label: "Cancelada", className: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]", icon: AlertCircle };
    default:
      return { label: estado, className: "bg-[var(--color-background)] text-[var(--color-text-secondary)]", icon: ClockIcon };
  }
}

function mapEstadoToStatus(estado: string): Exam["status"] {
  switch (estado) {
    case 'programada':
    case 'publicada':
      return 'upcoming';
    case 'en_curso':
      return 'upcoming';
    case 'finalizada':
      return 'completed';
    case 'cancelada':
      return 'cancelled';
    default:
      return 'upcoming';
  }
}

export default function GroupDetailModal({
  isOpen,
  onClose,
  grupoId,
  onExamClick,
}: GroupDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const { data, loading, error, fetchDetalle, clear } = useGrupoDetalle();

  useEffect(() => {
    if (isOpen && grupoId) {
      fetchDetalle(grupoId);
    }
    return () => {
      clear();
    };
  }, [isOpen, grupoId, fetchDetalle, clear]);

  if (!isOpen) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "info", label: "Información", icon: <FileText className="h-4 w-4" /> },
    { 
      id: "evaluaciones", 
      label: "Evaluaciones", 
      icon: <BookOpen className="h-4 w-4" />,
      count: data?.evaluaciones ? 
        data.evaluaciones.proximas.length + 
        data.evaluaciones.en_curso.length + 
        data.evaluaciones.completadas.length + 
        data.evaluaciones.canceladas.length 
        : 0 
    },
    { 
      id: "alumnos", 
      label: "Alumnos", 
      icon: <Users className="h-4 w-4" />,
      count: data?.alumnos?.length 
    },
  ];

  const allEvaluaciones = [
    ...(data?.evaluaciones.proximas || []),
    ...(data?.evaluaciones.en_curso || []),
    ...(data?.evaluaciones.completadas || []),
    ...(data?.evaluaciones.canceladas || []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-background)]">
          <h2 className="font-semibold text-lg text-[var(--color-text-primary)]">
            {data?.grupo?.nombre || "Cargando..."}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] p-1"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-[var(--color-border)] bg-white">
          <nav className="flex px-6" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                    : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background)]"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-[var(--color-primary)] text-white">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-primary)] border-t-transparent" />
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-8 text-[var(--color-danger)]">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-[var(--color-danger)]" />
              <p className="font-medium">Error al cargar el grupo</p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">{error}</p>
              <Button onClick={() => fetchDetalle(grupoId)} className="mt-4" size="sm">
                Reintentar
              </Button>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* Tab: Información */}
              {activeTab === "info" && (
                <div className="space-y-6" role="tabpanel">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="bg-[var(--color-background)] rounded-lg p-4">
                      <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                        Código del grupo
                      </p>
                      <p className="font-mono text-lg font-semibold text-[var(--color-text-primary)]">
                        {data.grupo.codigo}
                      </p>
                    </div>
                    <div className="bg-[var(--color-background)] rounded-lg p-4">
                      <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                        Categoría
                      </p>
                      <p className="font-semibold text-[var(--color-text-primary)] capitalize">
                        {data.grupo.categoria}
                      </p>
                    </div>
                    <div className="bg-[var(--color-background)] rounded-lg p-4">
                      <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                        Creado
                      </p>
                      <p className="font-semibold text-[var(--color-text-primary)]">
                        {formatDate(data.grupo.creado_en)}
                      </p>
                    </div>
                    <div className="bg-[var(--color-background)] rounded-lg p-4">
                      <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                        Total evaluaciones
                      </p>
                      <p className="font-semibold text-2xl text-[var(--color-primary)]">
                        {data.estadisticas.total_evaluaciones}
                      </p>
                    </div>
                  </div>

                  {data.grupo.descripcion && (
                    <div className="bg-[var(--color-background)] rounded-lg p-4">
                      <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
                        Descripción
                      </p>
                      <p className="text-[var(--color-text-primary)] whitespace-pre-wrap">
                        {data.grupo.descripcion}
                      </p>
                    </div>
                  )}

                  {/* Docente */}
                  <div className="bg-[var(--color-background)] rounded-lg p-4 border-t-2 border-[var(--color-primary)]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-semibold text-lg">
                        {data.grupo.docente?.nombre_completo?.charAt(0) || "D"}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                          Docente a cargo
                        </p>
                        <p className="font-semibold text-[var(--color-text-primary)]">
                          {data.grupo.docente?.nombre_completo || "No asignado"}
                        </p>
                        {data.grupo.docente?.correo && (
                          <p className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] mt-1">
                            <Mail className="h-3.5 w-3.5" />
                            {data.grupo.docente.correo}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Evaluaciones */}
              {activeTab === "evaluaciones" && (
                <div className="space-y-6" role="tabpanel">
                  {allEvaluaciones.length === 0 ? (
                    <div className="text-center py-12 text-[var(--color-text-secondary)]">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-[var(--color-border)]" />
                      <p className="font-medium">No hay evaluaciones en este grupo</p>
                      <p className="text-sm mt-1">El docente publicará evaluaciones próximamente</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[
                        { key: "proximas", label: "Próximas", items: data.evaluaciones.proximas, icon: ClockIcon, color: "primary" },
                        { key: "en_curso", label: "En curso", items: data.evaluaciones.en_curso, icon: AlertCircle, color: "warning" },
                        { key: "completadas", label: "Completadas", items: data.evaluaciones.completadas, icon: CheckCircle, color: "success" },
                        { key: "canceladas", label: "Canceladas", items: data.evaluaciones.canceladas, icon: AlertCircle, color: "danger" },
                      ].map((section) => {
                        if (section.items.length === 0) return null;
                        return (
                          <div key={section.key} className="space-y-2">
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                              <section.icon className={`h-4 w-4 text-[var(--color-${section.color})]`} />
                              {section.label} ({section.items.length})
                            </h4>
                            <div className="space-y-2">
                              {section.items.map((evalItem) => {
                                const badge = getEstadoBadge(evalItem.estado, evalItem.mi_estado);
                                const BadgeIcon = badge.icon;
                                const exam: Exam = {
                                  id: evalItem.id,
                                  unit: evalItem.titulo,
                                  date: new Date(evalItem.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).toUpperCase(),
                                  time: new Date(evalItem.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                                  status: mapEstadoToStatus(evalItem.estado),
                                  fecha_inicio_iso: evalItem.fecha_inicio,
                                  fecha_fin: evalItem.fecha_fin,
                                  tiempo_examen: evalItem.tiempo_examen,
                                };
                                return (
                                  <div
                                    key={evalItem.id}
                                    className="group bg-white border border-[var(--color-border)] rounded-lg p-4 hover:border-[var(--color-primary)] hover:shadow-sm transition-all cursor-pointer"
                                    onClick={() => onExamClick?.(exam)}
                                  >
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h5 className="font-semibold text-[var(--color-text-primary)] truncate">
                                            {evalItem.titulo}
                                          </h5>
                                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${badge.className} flex-shrink-0`}>
                                            <BadgeIcon className="h-3 w-3" />
                                            {badge.label}
                                          </span>
                                        </div>
                                        {evalItem.descripcion && (
                                          <p className="text-sm text-[var(--color-text-secondary)] line-clamp-1 mb-2">
                                            {evalItem.descripcion}
                                          </p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-secondary)]">
                                          <span className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Inicio: {formatDateTime(evalItem.fecha_inicio)}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5" />
                                            Fin: {formatTime(evalItem.fecha_fin)}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <ClockIcon className="h-3.5 w-3.5" />
                                            Duración: {evalItem.tiempo_examen} min
                                          </span>
                                        </div>
                                      </div>
                                      <ArrowRight className="h-5 w-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors flex-shrink-0" />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Alumnos */}
              {activeTab === "alumnos" && (
                <div className="space-y-4" role="tabpanel">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {data.alumnos.length} alumno{data.alumnos.length !== 1 ? "s" : ""} inscrito{data.alumnos.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {data.alumnos.length === 0 ? (
                    <div className="text-center py-12 text-[var(--color-text-secondary)]">
                      <Users className="h-12 w-12 mx-auto mb-4 text-[var(--color-border)]" />
                      <p className="font-medium">No hay alumnos inscritos</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {data.alumnos.map((alumno) => (
                        <div
                          key={alumno.id}
                          className="flex items-center justify-between px-4 py-3 bg-[var(--color-background)] rounded-lg hover:bg-[var(--color-border)] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-semibold">
                              {alumno.nombre_completo.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-[var(--color-text-primary)]">
                                {alumno.nombre_completo}
                              </p>
                              <p className="text-sm text-[var(--color-text-secondary)]">
                                {alumno.correo}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-[var(--color-text-muted)]">
                            Desde {formatDate(alumno.inscrito_en)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}