"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, Edit, Trash2, Users, FileText } from "lucide-react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSeparator } from "./Dropdown";
import { Card } from "./Card";
import { Button } from "./Button";

export interface Exam {
  id: number | string;
  unit: string;
  date: string;
  time?: string;
  status: "upcoming" | "completed" | "pending" | "cancelled";
  fecha_inicio_iso?: string;
  fecha_fin?: string;
  tiempo_examen?: number;
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
  onEdit?: (group: DocenteGroup) => void;
  onDelete?: (groupId: string) => void;
  onViewGroup?: (groupId: string) => void;
  onViewStudents?: (groupId: string) => void;
  onViewEvaluaciones?: (groupId: string) => void;
  onViewConfiguracion?: (groupId: string) => void;
  getSortedExams?: (exams: Exam[]) => Exam[];
  onExamClick?: (exam: Exam) => void;
  onViewDetails?: (groupId: string) => void;
}

const statusStyles: Record<Exam["status"], { bg: string; badge: string; label: string; datePrefix: string }> = {
  upcoming: { bg: "bg-[var(--color-primary-light)]", badge: "bg-white text-[var(--color-primary)]", label: "Próximo", datePrefix: "" },
  completed: { bg: "bg-[var(--color-success-bg)]", badge: "bg-[var(--color-success-bg)] text-[var(--color-success)]", label: "Realizado", datePrefix: "Evaluación realizada · " },
  pending: { bg: "bg-[var(--color-primary-light)]", badge: "bg-white text-[var(--color-primary)] border border-[var(--color-primary)]", label: "Pendiente", datePrefix: "" },
  cancelled: { bg: "bg-[var(--color-danger-bg)]", badge: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]", label: "Cancelado", datePrefix: "" },
};

export function GroupCard({
  group,
  variant,
  onEdit,
  onDelete,
  onViewGroup,
  onViewStudents,
  onViewEvaluaciones,
  onViewConfiguracion,
  getSortedExams,
  onExamClick,
  onViewDetails,
}: GroupCardProps) {
  const isAlumno = variant === "alumno";
  const isDocente = variant === "docente";
  const alumnoGroup = group as AlumnoGroup;
  const docenteGroup = group as DocenteGroup;

  const handleEdit = () => {
    onEdit?.(docenteGroup);
  };

  const handleDelete = () => {
    onDelete?.(String(group.id));
  };

  const handleViewGroup = () => {
    onViewGroup?.(String(group.id));
  };

  const handleViewDetails = () => {
    onViewDetails?.(String(group.id));
  };

  const handleViewStudents = () => {
    onViewStudents?.(String(group.id));
  };

  const handleViewEvaluaciones = () => {
    onViewEvaluaciones?.(String(group.id));
  };

  const handleViewConfiguracion = () => {
    onViewConfiguracion?.(String(group.id));
  };

  const [expanded, setExpanded] = useState(false);

  const handleHeaderClick = () => {
    if (isAlumno) {
      handleViewDetails();
    } else {
      setExpanded(!expanded);
    }
  };

  const sortedExams = isAlumno && getSortedExams ? getSortedExams(alumnoGroup.exams) : [];

  // Helper for alumno: get next upcoming exam
  const nextExam = isAlumno 
    ? sortedExams.find(e => e.status === "upcoming" || e.status === "pending")
    : null;

  if (isAlumno) {
    return (
      <Card variant="bordered" padding="none" className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full bg-white">
        {/* Header */}
        <div className="relative">
          <div className="absolute left-0 top-0 w-1 h-full bg-[var(--color-group-accent)]" />
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0 cursor-pointer" onClick={handleHeaderClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleHeaderClick(); }}>
                <p className="font-semibold text-base text-[var(--color-text-primary)] truncate">
                  {group.nombre}
                </p>
                <p className="font-normal text-xs text-[var(--color-text-secondary)] mt-0.5 flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-background)] border border-[var(--color-border)]">
                    {group.codigo}
                  </span>
                  <span className="text-[var(--color-text-muted)]">·</span>
                  <span className="capitalize">{group.categoria}</span>
                </p>
              </div>
              {/* Dropdown */}
              <Dropdown
                trigger={
                  <DropdownTrigger
                    className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background)] transition-colors flex-shrink-0"
                    aria-label="Más opciones"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </DropdownTrigger>
                }
                items={
                  <DropdownMenu>
                    <DropdownItem onClick={handleViewDetails}>
                      Ver detalles
                    </DropdownItem>
                  </DropdownMenu>
                }
                align="right"
                width={160}
              />
            </div>
          </div>
        </div>

        {/* Stats & Next Exam */}
        <div className="px-4 pb-4 space-y-3 border-t border-[var(--color-border)]">
          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {(alumnoGroup.estudiantes_count || 0)} estudiantes
            </span>
            {nextExam && (
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {sortedExams.length} evaluaciones
              </span>
            )}
          </div>

          {/* Next Exam Preview or Empty State */}
          {nextExam ? (
            <div className="bg-[var(--color-primary-light)] rounded-lg p-3 border border-[var(--color-primary)]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-[var(--color-text-primary)] truncate">
                      {nextExam.unit}
                    </p>
                    <p className="font-normal text-xs text-[var(--color-primary)]">Próxima</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-semibold text-xs text-[var(--color-primary)]">
                    {nextExam.fecha_inicio_iso ? new Date(nextExam.fecha_inicio_iso).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" }) : nextExam.date}
                  </p>
                  {nextExam.time && (
                    <p className="font-normal text-xs text-[var(--color-text-secondary)]">
                      {nextExam.time}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--color-background)] rounded-lg p-3 border border-[var(--color-border)]">
              <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <FileText className="h-4 w-4 text-[var(--color-border)]" />
                <span>No hay evaluaciones próximas</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Ver detalles */}
        <div className="px-4 py-3 bg-[var(--color-background)] border-t border-[var(--color-border)]">
          <button
            onClick={handleViewDetails}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors"
          >
            <span>Ver detalles del grupo</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </Card>
    );
  }

  // DOCENTE VARIANT - Original design
  return (
    <Card variant="bordered" padding="none" className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Group Header */}
      <div className="relative h-14 bg-[var(--color-background)] border-b border-[var(--color-border)] px-4 flex items-center justify-between">
        <div className="absolute left-0 top-0 w-1 h-full bg-[var(--color-group-accent)]" />
        <div 
          className="pl-4 flex-1 min-w-0 text-left cursor-pointer hover:bg-[var(--color-background)] transition-colors"
          onClick={handleHeaderClick}
          role={isAlumno ? "button" : undefined}
          tabIndex={isAlumno ? 0 : undefined}
          onKeyDown={isAlumno ? (e) => { if (e.key === "Enter" || e.key === " ") handleHeaderClick(); } : undefined}
        >
          <p className="font-semibold text-base leading-relaxed text-[var(--color-text-primary)] truncate">
            {group.nombre}
          </p>
          <p className="font-normal text-xs leading-relaxed text-[var(--color-text-secondary)] mt-0.5 truncate">
            {group.codigo} · {group.categoria}
          </p>
        </div>
        <div className="flex items-center gap-1">
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
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
                  <DropdownItem onClick={handleViewDetails}>
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

      {/* Expanded Content (Docente only) */}
      {expanded && isDocente && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-background)] p-4 animate-fade-in">
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
        </div>
      )}
    </Card>
  );
}