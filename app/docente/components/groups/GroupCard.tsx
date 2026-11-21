"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, Edit, Trash2, Users, FileText, Clock } from "lucide-react";

interface Group {
  id: number;
  name: string;
  code: string;
  subject: string;
  schedule: string;
  studentsCount: number;
  examsCount: number;
  createdAt: string;
  expanded: boolean;
}

interface GroupCardProps {
  group: Group;
  onToggle: (groupId: number) => void;
  onDelete: (groupId: number) => void;
  openDropdown: number | null;
  setOpenDropdown: (id: number | null) => void;
}

export default function GroupCard({ group, onToggle, onDelete, openDropdown, setOpenDropdown }: GroupCardProps) {
  const router = useRouter();

  return (
    <div
      className="bg-white border border-[#dedee8] rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      {/* Group Header */}
      <div className="relative h-14 bg-[#f6f6fa] border-b border-[#dedee8] px-4 flex items-center justify-between">
        <div className="absolute left-0 top-0 w-1 h-full bg-[#95c9a4]" />
        <div className="pl-4 flex-1 min-w-0">
          <p className="font-semibold text-base leading-relaxed text-[#232334] truncate">
            {group.name}
          </p>
          <p className="font-normal text-xs leading-relaxed text-[#747487] mt-0.5 truncate">
            {group.code} · {group.subject}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(group.id);
            }}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-700 hover:bg-white transition-colors"
            aria-label={group.expanded ? "Colapsar" : "Expandir"}
          >
            {group.expanded ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          <div className="relative dropdown-container">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(openDropdown === group.id ? null : group.id);
              }}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-700 hover:bg-white transition-colors"
              aria-label="Más opciones"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {/* Dropdown menu */}
            {openDropdown === group.id && (
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg border border-[#dedee8] shadow-lg py-1 z-20">
                <button
                  onClick={() => {
                    router.push(`/docente/grupos/${group.id}`);
                    setOpenDropdown(null);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#232334] hover:bg-[#f6f6fa] font-medium text-left"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    router.push(`/docente/grupos/${group.id}/estudiantes`);
                    setOpenDropdown(null);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#232334] hover:bg-[#f6f6fa] font-medium text-left"
                >
                  <Users className="h-4 w-4" />
                  Estudiantes
                </button>
                <button
                  onClick={() => {
                    router.push(`/docente/grupos/${group.id}/evaluaciones`);
                    setOpenDropdown(null);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#232334] hover:bg-[#f6f6fa] font-medium text-left"
                >
                  <FileText className="h-4 w-4" />
                  Evaluaciones
                </button>
                <hr className="my-1 border-[#dedee8]" />
                <button
                  onClick={() => {
                    onDelete(group.id);
                    setOpenDropdown(null);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#ad3040] hover:bg-[#f6f6fa] font-medium text-left"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Group Content */}
      <div className="p-4 space-y-4">
        {/* Info Row */}
        <div className="flex items-center gap-4 text-xs text-zinc-600">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {group.schedule}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {group.studentsCount} estudiantes
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {group.examsCount} evaluaciones
          </span>
        </div>

        <div className="pt-2 border-t border-[#dedee8] flex items-center justify-between">
          <span className="font-normal text-xs leading-relaxed text-[#747487]">
            Creado el {new Date(group.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })}
          </span>
          <button
            onClick={() => router.push(`/docente/grupos/${group.id}`)}
            className="text-sm font-medium text-[#6543ab] hover:underline"
          >
            Ver grupo →
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {group.expanded && (
        <div className="border-t border-[#dedee8] bg-[#fafafa] p-4 animate-fade-in">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href={`/docente/grupos/${group.id}/estudiantes`}
              className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#dedee8] hover:border-[#6543ab] hover:bg-[#f0eafb] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#e5f2e8] flex items-center justify-center">
                <Users className="h-4 w-4 text-[#336647]" />
              </div>
              <div>
                <p className="font-medium text-sm text-zinc-900">Estudiantes</p>
                <p className="text-xs text-zinc-500">{group.studentsCount} inscritos</p>
              </div>
            </Link>
            <Link
              href={`/docente/grupos/${group.id}/evaluaciones`}
              className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#dedee8] hover:border-[#6543ab] hover:bg-[#f0eafb] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#fef3c7] flex items-center justify-center">
                <FileText className="h-4 w-4 text-[#b45309]" />
              </div>
              <div>
                <p className="font-medium text-sm text-zinc-900">Evaluaciones</p>
                <p className="text-xs text-zinc-500">{group.examsCount} creadas</p>
              </div>
            </Link>
            <Link
              href={`/docente/grupos/${group.id}/configuracion`}
              className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#dedee8] hover:border-[#6543ab] hover:bg-[#f0eafb] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#f0eafb] flex items-center justify-center">
                <svg className="h-4 w-4 text-[#6543ab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-sm text-zinc-900">Configuración</p>
                <p className="text-xs text-zinc-500">Ajustes del grupo</p>
              </div>
            </Link>
            <button
              onClick={() => onDelete(group.id)}
              className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#dedee8] hover:border-[#ad3040] hover:bg-[#fef2f2] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#fef2f2] flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-[#ad3040]" />
              </div>
              <div>
                <p className="font-medium text-sm text-zinc-900">Eliminar grupo</p>
                <p className="text-xs text-zinc-500">Acción irreversible</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}