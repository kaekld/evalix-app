"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Mail, User, Calendar, ExternalLink } from "lucide-react";
import StudentDetailModal from "@/app/docente/components/modals/StudentDetailModal";

interface Grupo {
  id: string;
  nombre: string;
  codigo: string;
}

interface Alumno {
  id: string;
  matricula: string;
  nombre_completo: string;
  correo: string;
  usuario_activo: boolean;
}

interface Estudiante {
  id: string;
  grupo_id: string;
  grupo_nombre: string;
  grupo_codigo: string;
  alumno_id: string;
  inscrito_en: string;
  activo: boolean;
  alumno: Alumno;
}

interface EstudiantesGlobalProps {
  grupos: Grupo[];
  initialEstudiantes: Estudiante[];
  initialTotal: number;
}

export default function EstudiantesGlobal({ grupos, initialEstudiantes, initialTotal }: EstudiantesGlobalProps) {
  const router = useRouter();
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>(initialEstudiantes);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedGrupoId, setSelectedGrupoId] = useState<string>("all");
  const [page, setPage] = useState(0);
  const LIMIT = 20;
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(null);

  const fetchEstudiantes = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const offset = reset ? 0 : page * LIMIT;
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: offset.toString(),
      });
      if (search) params.set('search', search);
      if (selectedGrupoId !== "all") params.set('grupo_id', selectedGrupoId);

      const res = await fetch(`/api/docente/estudiantes?${params.toString()}`);
      if (!res.ok) throw new Error("Error al cargar estudiantes");
      const data = await res.json();

      if (reset) {
        setEstudiantes(data.estudiantes);
      } else {
        setEstudiantes((prev) => [...prev, ...data.estudiantes]);
      }
      setTotal(data.total);
      if (!reset) setPage((p) => p + 1);
    } catch {
      // Error handled in UI
    } finally {
      setLoading(false);
    }
  }, [search, selectedGrupoId, page, LIMIT]);

  // fetchEstudiantes calls setState internally - intentional for data fetching
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchEstudiantes(true); }, [fetchEstudiantes]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
    fetchEstudiantes(true);
  };

  const handleGrupoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGrupoId(e.target.value);
    setPage(0);
    fetchEstudiantes(true);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 100 && !loading && estudiantes.length < total) {
      fetchEstudiantes(false);
    }
  };

  const handleViewGroup = (grupoId: string) => {
    router.push(`/docente/grupos/${grupoId}`);
  };

  const handleViewStudent = (estudiante: Estudiante) => {
    setSelectedEstudiante(estudiante);
    setShowDetailModal(true);
  };

  const filteredEstudiantes = estudiantes;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-zinc-500">Todos los grupos</p>
          <h1 className="font-semibold text-2xl leading-relaxed text-[#232334] tracking-tight">
            Estudiantes
          </h1>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white border border-[#dedee8] rounded-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#e5f2e8] flex items-center justify-center">
            <Users className="h-6 w-6 text-[#336647]" />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Total estudiantes</p>
            <p className="text-2xl font-bold text-zinc-900">{total}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Group filter */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <select
              value={selectedGrupoId}
              onChange={handleGrupoChange}
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-[#dedee8] focus:outline-none focus:ring-2 focus:ring-[#6543ab]/20 focus:border-[#6543ab] transition-colors appearance-none bg-white"
            >
              <option value="all">Todos los grupos</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre} ({g.codigo})
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, matrícula, correo o grupo..."
              value={search}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#dedee8] focus:outline-none focus:ring-2 focus:ring-[#6543ab]/20 focus:border-[#6543ab] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-[#dedee8] rounded-xl overflow-hidden">
        {loading && estudiantes.length === 0 ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4">
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
            <p className="text-lg">No hay estudiantes</p>
            <p className="text-sm">{search ? "Intenta con otra búsqueda" : "No hay estudiantes inscritos en tus grupos"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f6f6fa] border-b border-[#dedee8]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Estudiante</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Matrícula</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Correo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Grupo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Inscrito</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dedee8]" onScroll={handleScroll}>
                {filteredEstudiantes.map((estudiante) => (
                  <tr
                    key={estudiante.id}
                    className="hover:bg-[#f6f6fa] transition-colors cursor-pointer"
                    onClick={() => handleViewStudent(estudiante)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#f0eafb] flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-[#6543ab]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-zinc-900 truncate">{estudiante.alumno.nombre_completo}</p>
                          {!estudiante.alumno.usuario_activo && (
                            <p className="text-xs text-red-600">Usuario inactivo</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-700 font-mono">{estudiante.alumno.matricula}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-zinc-700">
                        <Mail className="h-4 w-4 text-zinc-400" />
                        <span className="truncate max-w-xs">{estudiante.alumno.correo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewGroup(estudiante.grupo_id);
                        }}
                        className="flex items-center gap-1 text-sm text-[#6543ab] hover:underline"
                      >
                        <span className="font-medium">{estudiante.grupo_nombre}</span>
                        <span className="text-zinc-500">({estudiante.grupo_codigo})</span>
                        <ExternalLink className="h-3 w-3 opacity-50 hover:opacity-100" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-700">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                        {new Date(estudiante.inscrito_en).toLocaleDateString("es-ES")}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {estudiante.activo ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e5f2e8] text-[#336647]">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fef2f2] text-[#ad3040]">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewStudent(estudiante);
                        }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-[#6543ab] hover:bg-[#f6f6fa] transition-colors"
                        aria-label="Ver detalle"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Load more / Pagination */}
        {estudiantes.length > 0 && estudiantes.length < total && !loading && (
          <div className="p-4 border-t border-[#dedee8]">
            <button
              onClick={() => fetchEstudiantes(false)}
              className="w-full py-2 text-sm text-[#6543ab] hover:underline"
            >
              Cargar más ({estudiantes.length} de {total})
            </button>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      <StudentDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        alumnoId={selectedEstudiante?.alumno_id || ''}
        alumnoInfo={{
          id: selectedEstudiante?.alumno.id || '',
          matricula: selectedEstudiante?.alumno.matricula || '',
          nombre_completo: selectedEstudiante?.alumno.nombre_completo || '',
          correo: selectedEstudiante?.alumno.correo || '',
          activo: selectedEstudiante?.alumno.usuario_activo ?? true,
          grupos: selectedEstudiante ? [{
            id: selectedEstudiante.grupo_id,
            nombre: selectedEstudiante.grupo_nombre,
            codigo: selectedEstudiante.grupo_codigo,
          }] : [],
        }}
      />
    </div>
  );
}