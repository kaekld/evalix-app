"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, Edit, Trash2, Users, FileText, ChevronDown } from "lucide-react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSeparator } from "./Dropdown";
import { Badge, StatusBadge } from "./Badge";
import { Card } from "./Card";
import { Button } from "./Button";

export interface Exam {
  id: number | string;
  unit: string;
  date: string;
  time?: string;
  status: "upcoming" | "completed" | "pending" | "cancelled";
}

export interface GroupBase {
  id: string | number;
  nombre: string;
  codigo: string;
  categoria: string;
  estudiantes_count?: number;
  creado_en?: string;
  expanded?: boolean;
}

export interface DocenteGroup extends GroupBase {
  descripcion?: string | null;
  evaluaciones_count?: number;
  activo?: boolean;
}

export interface AlumnoGroup extends GroupBase {
  exams: Exam[];
}

type GroupVariant = "docente" | "alumno";

export interface GroupCardProps {
  group: DocenteGroup | AlumnoGroup;
  variant: GroupVariant;
  onToggle?: (groupId: string | number) => void;
  onEdit?: (group: DocenteGroup) => void;
  onDelete?: (groupId: string | number) => void;
  onViewGroup?: (groupId: string | number) => void;
  onViewStudents?: (groupId: string | number) => void;
  onViewEvaluaciones?: (groupId: string | number) => void;
  onViewConfiguracion?: (groupId: string | number) => void;
  getSortedExams?: (exams: Exam[]) => Exam[];
}

const statusStyles: Record<Exam["status"], { bg: string; badge: string; label: string; datePrefix: string }> = {
  upcoming: { bg: "bg-[var(--color-primary-light)]", badge: "bg-white text-[var(--color-primary)]", label: "Próximo", datePrefix: "" },
  completed: { bg: "bg-[var(--color-success-bg)]", badge: "bg-[var(--color-success-bg)] text-[var(--color-success)]", label: "Realizado", datePrefix: "Examen realizado · " },
  pending: { bg: "bg-[var(--color-primary-light)]", badge: "bg-white text-[var(--color-primary)] border border-[var(--color-primary)]", label: "Pendiente", datePrefix: "" },
  cancelled: { bg: "bg-[var(--color-danger-bg)]", badge: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]", label: "Cancelado", datePrefix: "" },
};

export function GroupCard({
  group,
  variant,
  onToggle,
  onEdit,
  onDelete,
  onViewGroup,
  onViewStudents,
  onViewEvaluaciones,
  onViewConfiguracion,
  getSortedExams,
}: GroupCardProps) {
  const router = useRouter();
  const isAlumno = variant === "alumno";
  const isDocente = variant === "docente";
  const alumnoGroup = group as AlumnoGroup;
  const docenteGroup = group as DocenteGroup;

  const handleEdit = () => {
    onEdit?.(docenteGroup);
  };

  const handleDelete = () => {
    onDelete?.(group.id);
  };

  const handleViewGroup = () => {
    onViewGroup?.(group.id);
  };

  const handleViewStudents = () => {
    onViewStudents?.(group.id);
  };

  const handleViewEvaluaciones = () => {
    onViewEvaluaciones?.(group.id);
  };

  const handleViewConfiguracion = () => {
    onViewConfiguracion?.(group.id);
  };

  const sortedExams = isAlumno && getSortedExams ? getSortedExams(alumnoGroup.exams) : [];

  const toggleExpanded = () => {
    onToggle?.(group.id);
  };

  return (
    <Card variant="bordered" padding="none" className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Group Header */}
      <div className="relative h-14 bg-[var(--color-background)] border-b border-[var(--color-border)] px-4 flex items-center justify-between">
        <div className="absolute left-0 top-0 w-1 h-full bg-[var(--color-group-accent)]" />
        <button
          onClick={toggleExpanded}
          className="pl-4 flex-1 min-w-0 text-left"
          aria-expanded={group.expanded}
          aria-controls={`group-content-${group.id}`}
        >
          <p className="font-semibold text-base leading-relaxed text-[var(--color-text-primary)] truncate">
            {group.nombre}
          </p>
          <p className="font-normal text-xs leading-relaxed text-[var(--color-text-secondary)] mt-0.5 truncate">
            {group.codigo} · {group.categoria}
          </p>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleExpanded}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-white transition-colors"
            aria-label={group.expanded ? "Colapsar" : "Expandir"}
          >
            <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${group.expanded ? "rotate-180" : ""}`} />
          </button>
          <Dropdown
            trigger={
              <DropdownTrigger
                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-white transition-colors"
                aria-label="Más opciones"
              >
                <MoreVertical className="h-5 w-5" />
              </DropdownTrigger>
            }
            items={
              <DropdownMenu>
                {isDocente && (
                  <>
                    <DropdownItem onClick={handleEdit}>
                      <Edit className="h-4 w-4" />
                      Editar
                    </DropdownItem>
                    <DropdownItem onClick={handleViewGroup}>
                      <Users className="h-4 w-4" />
                      Ver grupo
                    </DropdownItem>
                    <DropdownItem onClick={handleViewStudents}>
                      <Users className="h-4 w-4" />
                      Estudiantes
                    </DropdownItem>
                    <DropdownItem onClick={handleViewEvaluaciones}>
                      <FileText className="h-4 w-4" />
                      Evaluaciones
                    </DropdownItem>
                    <DropdownItem onClick={handleViewConfiguracion}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Configuración
                    </DropdownItem>
                    <DropdownSeparator />
                    <DropdownItem onClick={handleDelete} danger>
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </DropdownItem>
                  </>
                )}
                {isAlumno && (
                  <DropdownItem onClick={handleViewGroup}>
                    Ver detalles
                  </DropdownItem>
                )}
              </DropdownMenu>
            }
            align="right"
            width={200}
          />
        </div>
      </div>

      {/* Group Content */}
      <div className="p-4 space-y-4" id={`group-content-${group.id}`}>
        {/* Info Row */}
        <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {(isDocente ? docenteGroup.estudiantes_count : alumnoGroup.estudiantes_count) || 0} estudiantes
          </span>
          {isDocente && docenteGroup.evaluaciones_count !== undefined && (
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {docenteGroup.evaluaciones_count} evaluaciones
            </span>
          )}
        </div>

        <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
          <span className="font-normal text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {group.creado_en
              ? `Creado el ${new Date(group.creado_en).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })}`
              : ""}
          </span>
          {isDocente && (
            <Button variant="ghost" size="sm" onClick={handleViewGroup}>
              Ver grupo
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {group.expanded && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-background)] p-4 animate-fade-in">
          {isDocente ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href={`/docente/grupos/${group.id}/estudiantes`}
                className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--color-success-bg)] flex items-center justify-center">
                  <Users className="h-4 w-4 text-[var(--color-success)]" />
                </div>
                <div>
                  <p className="font-medium text-sm text-[var(--color-text-primary)]">Estudiantes</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{docenteGroup.estudiantes_count || 0} inscritos</p>
                </div>
              </Link>
              <Link
                href={`/docente/grupos/${group.id}/evaluaciones`}
                className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--color-warning-bg)] flex items-center justify-center">
                  <FileText className="h-4 w-4 text-[var(--color-warning)]" />
                </div>
                <div>
                  <p className="font-medium text-sm text-[var(--color-text-primary)]">Evaluaciones</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{docenteGroup.evaluaciones_count || 0} creadas</p>
                </div>
              </Link>
              <Link
                href={`/docente/grupos/${group.id}/configuracion`}
                className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center">
                  <svg className="h-4 w-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm text-[var(--color-text-primary)]">Configuración</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Ajustes del grupo</p>
                </div>
              </Link>
              <button
                onClick={handleDelete}
                className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[var(--color-border)] hover:border-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--color-danger-bg)] flex items-center justify-center">
                  <Trash2 className="h-4 w-4 text-[var(--color-danger)]" />
                </div>
                <div>
                  <p className="font-medium text-sm text-[var(--color-text-primary)]">Eliminar grupo</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Acción irreversible</p>
                </div>
              </button>
            </div>
          ) : (
            sortedExams.length === 0 ? (
              <p className="font-normal text-sm leading-normal text-[var(--color-text-secondary)] pt-4">
                No hay ningún examen registrado.
              </p>
            ) : (
              <div className="space-y-3 pt-4">
                {sortedExams.map((exam) => {
                  const styles = statusStyles[exam.status];
                  return (
                    <div key={exam.id} className={`rounded-lg p-4 ${styles.bg} border border-[var(--color-border)]`}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-base leading-normal text-[var(--color-text-primary)]">
                            {exam.unit}
                          </p>
                          <p className="font-normal text-xs leading-normal text-[var(--color-text-secondary)] mt-0.5">
                            {styles.datePrefix}{exam.date}{exam.time ? ` · ${exam.time}` : ""}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center justify-center px-3 h-7 rounded-full font-semibold text-xs leading-normal ${styles.badge}`}>
                            {styles.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      )}
    </Card>
  );
}