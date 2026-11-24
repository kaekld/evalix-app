"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Users, Trash2, UserPlus, Mail, User, Calendar } from "lucide-react";
import InscribirEstudiantesModal from "@/app/docente/components/modals/InscribirEstudiantesModal";
import ConfirmDeleteModal from "@/app/docente/components/modals/ConfirmDeleteModal";
import StudentDetailModal from "@/app/docente/components/modals/StudentDetailModal";

interface Grupo {
  id: string;
  nombre: string;
  codigo: string;
  categoria: string;
}

interface Estudiante {
  id: string;
  grupo_id: string;
  alumno_id: string;
  inscrito_en: string;
  activo: boolean;
  alumno: {
    id: string;
    matricula: string;
    nombre_completo: string;
    correo: string;
  };
}

interface GrupoEstudiantesProps {
  grupo: Grupo;
}

export default function GrupoEstudiantes({ grupo }: GrupoEstudiantesProps) {
  const router = useRouter();
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showInscribirModal, setShowInscribirModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [estudianteToDelete, setEstudianteToDelete] = useState<Estudiante | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(null);

  const fetchEstudiantes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/docente/grupos/${grupo.id}/estudiantes`);
      if (!res.ok) throw new Error("Error al cargar estudiantes");
      const data = await res.json();
      setEstudiantes(data);
    } catch {
      // Error handled in UI
    } finally {
      setLoading(false);
    }
  }, [grupo.id]);

  // fetchEstudiantes calls setState internally - this is intentional for data fetching
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEstudiantes();
  }, [fetchEstudiantes]);

  const filteredEstudiantes = estudiantes.filter(
    (e) =>
      e.alumno.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
      e.alumno.matricula.toLowerCase().includes(search.toLowerCase()) ||
      e.alumno.correo.toLowerCase().includes(search.toLowerCase())
  );

  const handleUnenroll = async (estudiante: Estudiante) => {
    setEstudianteToDelete(estudiante);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!estudianteToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/docente/grupos/${grupo.id}/estudiantes/${estudianteToDelete.alumno_id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al desinscribir estudiante");
      }
      setEstudiantes((prev) => prev.filter((e) => e.id !== estudianteToDelete.id));
    } catch {
      // Error handled
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setEstudianteToDelete(null);
    }
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
    await fetchEstudiantes();
    setShowInscribirModal(false);
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
          <p className="text-sm text-zinc-500">Grupo / {grupo.nombre}</p>
          <h1 className="font-semibold text-2xl leading-relaxed text-[#232334] tracking-tight">
            Estudiantes
          </h1>
        </div>
        <button
          onClick={() => setShowInscribirModal(true)}
          className="flex items-center gap-2 h-11 px-5 rounded-lg bg-[#6543AB] font-semibold text-sm text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          Inscribir estudiantes
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 p-4 bg-white border border-[#dedee8] rounded-xl">
        <div className="w-12 h-12 rounded-xl bg-[#e5f2e8] flex items-center justify-center">
          <Users className="h-6 w-6 text-[#336647]" />
        </div>
        <div>
          <p className="text-sm text-zinc-500">Total inscritos</p>
          <p className="text-2xl font-bold text-zinc-900">{estudiantes.filter(e => e.activo).length}</p>
        </div>
        <div className="ml-auto flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, matrícula o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#dedee8] focus:outline-none focus:ring-2 focus:ring-[#6543ab]/20 focus:border-[#6543ab] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Students list */}
      <div className="bg-white border border-[#dedee8] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-[#e0e0e0]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#e0e0e0] rounded w-1/4" />
                  <div className="h-3 bg-[#e0e0e0] rounded w-1/3" />
                </div>
                <div className="w-10 h-10 rounded-lg bg-[#e0e0e0]" />
              </div>
            ))}
          </div>
        ) : filteredEstudiantes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <Users className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-lg">No hay estudiantes inscritos</p>
            <p className="text-sm">Haz clic en &ldquo;Inscribir estudiantes&rdquo; para agregar alumnos a este grupo</p>
          </div>
        ) : (
          <div className="divide-y divide-[#dedee8]">
            {filteredEstudiantes.map((estudiante) => (
              <div
                key={estudiante.id}
                className="flex items-center gap-4 p-4 hover:bg-[#f6f6fa] transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedEstudiante(estudiante);
                  setShowDetailModal(true);
                }}
              >
                <div className="w-10 h-10 rounded-full bg-[#f0eafb] flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-[#6543ab]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-zinc-900 truncate">{estudiante.alumno.nombre_completo}</p>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {estudiante.alumno.correo}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {estudiante.alumno.matricula}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Inscrito: {new Date(estudiante.inscrito_en).toLocaleDateString("es-ES")}
                    </span>
                    {!estudiante.activo && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#fef2f2] text-[#ad3040]">
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleUnenroll(estudiante)}
                  disabled={deleting}
                  className="p-2 rounded-lg text-zinc-500 hover:text-[#ad3040] hover:bg-[#fef2f2] transition-colors disabled:opacity-50"
                  aria-label="Desinscribir estudiante"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <InscribirEstudiantesModal
        isOpen={showInscribirModal}
        onClose={() => setShowInscribirModal(false)}
        onEnroll={handleEnroll}
        grupoId={grupo.id}
      />
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setEstudianteToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Desinscribir estudiante"
        message={`¿Estás seguro de que quieres desinscribir a "${estudianteToDelete?.alumno.nombre_completo}" del grupo "${grupo.nombre}"? El estudiante perderá acceso a las evaluaciones de este grupo.`}
        confirmText="Desinscribir"
        variant="warning"
      />
      <StudentDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        alumnoId={selectedEstudiante?.alumno.id || ''}
        alumnoInfo={{
          id: selectedEstudiante?.alumno.id || '',
          matricula: selectedEstudiante?.alumno.matricula || '',
          nombre_completo: selectedEstudiante?.alumno.nombre_completo || '',
          correo: selectedEstudiante?.alumno.correo || '',
          activo: selectedEstudiante?.activo ?? true,
          grupos: [{ id: grupo.id, nombre: grupo.nombre, codigo: grupo.codigo }],
        }}
      />
    </div>
  );
}