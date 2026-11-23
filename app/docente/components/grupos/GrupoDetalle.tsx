"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, FileText, Settings, Edit, Trash2, MoreVertical, UserPlus } from "lucide-react";
import InscribirEstudiantesModal from "@/app/docente/components/modals/InscribirEstudiantesModal";
import EditarGrupoModal from "@/app/docente/components/modals/EditarGrupoModal";
import ConfirmDeleteModal from "@/app/docente/components/modals/ConfirmDeleteModal";

interface Grupo {
  id: string;
  nombre: string;
  codigo: string;
  categoria: string;
  descripcion: string | null;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
  institucion_id: string;
  estudiantes_count: number;
}

interface GrupoDetalleProps {
  grupo: Grupo;
}

export default function GrupoDetalle({ grupo }: GrupoDetalleProps) {
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [showInscribirModal, setShowInscribirModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEdit = () => {
    setOpenDropdown(null);
    setShowEditarModal(true);
  };

  const handleInscribir = () => {
    setOpenDropdown(null);
    setShowInscribirModal(true);
  };

  const handleDelete = () => {
    setOpenDropdown(null);
    setShowDeleteModal(true);
  };

  const handleUpdate = async (id: string, data: { nombre: string; descripcion: string; activo: boolean }) => {
    const res = await fetch(`/api/docente/grupos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al actualizar grupo");
    }
    // Refresh page to get updated data
    router.refresh();
  };

  const handleEnroll = async (alumnoIds: string[]) => {
    const res = await fetch(`/api/docente/grupos/${grupo.id}/estudiantes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alumno_ids: alumnoIds }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al inscribir estudiantes");
    }
    router.refresh();
  };

  const handleDeleteConfirm = async () => {
    const res = await fetch(`/api/docente/grupos/${grupo.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al eliminar grupo");
    }
    router.push("/docente/grupos");
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-700 hover:bg-white transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <p className="text-sm text-zinc-500">Grupo</p>
          <h1 className="font-semibold text-2xl leading-relaxed text-[#232334] tracking-tight">
            {grupo.nombre}
          </h1>
        </div>
        <div className="relative dropdown-container">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown(openDropdown === grupo.id ? null : grupo.id);
            }}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-700 hover:bg-white transition-colors"
            aria-label="Más opciones"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {openDropdown === grupo.id && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg border border-[#dedee8] shadow-lg py-1 z-20">
              <button
                onClick={handleEdit}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#232334] hover:bg-[#f6f6fa] font-medium text-left"
              >
                <Edit className="h-4 w-4" />
                Editar grupo
              </button>
              <button
                onClick={handleInscribir}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#232334] hover:bg-[#f6f6fa] font-medium text-left"
              >
                <UserPlus className="h-4 w-4" />
                Inscribir estudiantes
              </button>
              <hr className="my-1 border-[#dedee8]" />
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#ad3040] hover:bg-[#f6f6fa] font-medium text-left"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar grupo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href={`/docente/grupos/${grupo.id}/estudiantes`}
          className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#dedee8] hover:border-[#6543ab] hover:bg-[#f0eafb] transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-[#e5f2e8] flex items-center justify-center">
            <Users className="h-6 w-6 text-[#336647]" />
          </div>
          <div>
            <p className="font-medium text-sm text-zinc-900">Estudiantes</p>
            <p className="text-2xl font-bold text-zinc-900">{grupo.estudiantes_count}</p>
          </div>
        </Link>

        <Link
          href={`/docente/grupos/${grupo.id}/evaluaciones`}
          className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#dedee8] hover:border-[#6543ab] hover:bg-[#f0eafb] transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-[#fef3c7] flex items-center justify-center">
            <FileText className="h-6 w-6 text-[#b45309]" />
          </div>
          <div>
            <p className="font-medium text-sm text-zinc-900">Evaluaciones</p>
            <p className="text-2xl font-bold text-zinc-900">0</p>
          </div>
        </Link>

        <Link
          href={`/docente/grupos/${grupo.id}/configuracion`}
          className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#dedee8] hover:border-[#6543ab] hover:bg-[#f0eafb] transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-[#f0eafb] flex items-center justify-center">
            <Settings className="h-6 w-6 text-[#6543ab]" />
          </div>
          <div>
            <p className="font-medium text-sm text-zinc-900">Configuración</p>
            <p className="text-2xl font-bold text-zinc-900">Ajustes</p>
          </div>
        </Link>
      </div>

      {/* Group info card */}
      <div className="bg-white border border-[#dedee8] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#dedee8] bg-[#f6f6fa]">
          <h2 className="font-semibold text-zinc-900">Información del grupo</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Código</p>
              <p className="font-mono text-base text-zinc-900 mt-1">{grupo.codigo}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Categoría</p>
              <p className="text-base text-zinc-900 mt-1">{grupo.categoria}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Estado</p>
              <p className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  grupo.activo
                    ? "bg-[#e5f2e8] text-[#336647]"
                    : "bg-[#fef2f2] text-[#ad3040]"
                }`}>
                  {grupo.activo ? "Activo" : "Inactivo"}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Creado</p>
              <p className="text-base text-zinc-900 mt-1">
                {new Date(grupo.creado_en).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {grupo.descripcion && (
            <div className="pt-4 border-t border-[#dedee8]">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Descripción</p>
              <p className="text-base text-zinc-700 mt-1 whitespace-pre-wrap">{grupo.descripcion}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditarGrupoModal
        isOpen={showEditarModal}
        onClose={() => setShowEditarModal(false)}
        onUpdate={handleUpdate}
        grupo={grupo}
      />
      <InscribirEstudiantesModal
        isOpen={showInscribirModal}
        onClose={() => setShowInscribirModal(false)}
        onEnroll={handleEnroll}
        grupoId={grupo.id}
      />
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar grupo"
        message={`¿Estás seguro de que quieres eliminar el grupo "${grupo.nombre}"? Esta acción no se puede deshacer y solo es posible si no hay estudiantes inscritos.`}
        confirmText="Eliminar grupo"
        variant="danger"
      />
    </div>
  );
}