"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Search, Check, UserPlus, Loader2 } from "lucide-react";

interface Alumno {
  id: string;
  matricula: string;
  nombre_completo: string;
  correo: string;
}

interface InscribirEstudiantesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (alumnoIds: string[]) => void;
  grupoId: string;
}

export default function InscribirEstudiantesModal({ isOpen, onClose, onEnroll, grupoId }: InscribirEstudiantesModalProps) {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Sync indeterminate state
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedIds.length > 0 && selectedIds.length < alumnos.length;
      selectAllRef.current.checked = selectedIds.length > 0 && selectedIds.length === alumnos.length;
    }
  }, [selectedIds, alumnos.length]);

  const fetchAlumnos = useCallback(async (reset = false) => {
    if (reset) setLoading(true);
    setError("");

    try {
      const offset = reset ? 0 : page * LIMIT;
      const res = await fetch(`/api/docente/alumnos?grupo_id=${grupoId}&limit=${LIMIT}&offset=${offset}&search=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error("Error al cargar alumnos");
      const data = await res.json();
      
      if (reset) {
        setAlumnos(data.alumnos);
      } else {
        setAlumnos((prev) => [...prev, ...data.alumnos]);
      }
      setHasMore(data.alumnos.length === LIMIT);
      if (!reset) setPage((p) => p + 1);
    } catch {
      setError("Error al cargar la lista de alumnos");
    } finally {
      setLoading(false);
    }
  }, [grupoId, search, page, LIMIT]);

  // Reset and fetch when modal opens or grupoId changes
  useEffect(() => {
    if (isOpen) {
      // Resetting form state when modal opens is intentional UX
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIds([]);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearch("");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPage(0);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasMore(true);
      // fetchAlumnos calls setState internally - intentional for data fetching
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchAlumnos(true);
    }
  }, [isOpen, grupoId, fetchAlumnos]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
    fetchAlumnos(true);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === alumnos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(alumnos.map((a) => a.id));
    }
  };

  const handleEnroll = async () => {
    if (selectedIds.length === 0) return;
    setEnrolling(true);
    setError("");

    try {
      await onEnroll(selectedIds);
      onClose();
    } catch {
      setError("Error al inscribir estudiantes");
    } finally {
      setEnrolling(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !loading) {
      fetchAlumnos(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#dedee8]">
          <h2 className="text-lg font-semibold text-zinc-900">Inscribir estudiantes</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#f6f6fa] transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[#dedee8] relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, matrícula o correo..."
              value={search}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#dedee8] focus:outline-none focus:ring-2 focus:ring-[#6543ab]/20 focus:border-[#6543ab] transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
          {error && (
            <div className="p-3 mx-4 mt-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading && alumnos.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-[#6543ab]" />
            </div>
          ) : alumnos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-zinc-500">
              <UserPlus className="h-12 w-12 mb-2 opacity-50" />
              <p>No hay alumnos disponibles para inscribir</p>
              <p className="text-sm">Todos los alumnos de la institución ya están inscritos o no hay alumnos registrados</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {/* Select all header */}
              <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#f6f6fa] cursor-pointer">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-[#dedee8] text-[#6543ab] focus:ring-2 focus:ring-[#6543ab]/20"
                />
                <span className="text-sm font-medium text-zinc-700">
                  {selectedIds.length > 0 ? `${selectedIds.length} de ${alumnos.length} seleccionados` : "Seleccionar todos"}
                </span>
              </label>

              {alumnos.map((alumno) => (
                <label
                  key={alumno.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                    selectedIds.includes(alumno.id)
                      ? "bg-[#f0eafb] border-[#6543ab]"
                      : "border-transparent hover:bg-[#f6f6fa]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(alumno.id)}
                    onChange={() => toggleSelection(alumno.id)}
                    className="h-4 w-4 rounded border-[#dedee8] text-[#6543ab] focus:ring-2 focus:ring-[#6543ab]/20"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-zinc-900 truncate">{alumno.nombre_completo}</p>
                    <p className="text-xs text-zinc-500">{alumno.matricula} · {alumno.correo}</p>
                  </div>
                  {selectedIds.includes(alumno.id) && (
                    <Check className="h-5 w-5 text-[#6543ab]" />
                  )}
                </label>
              ))}

              {hasMore && !loading && (
                <button
                  onClick={() => fetchAlumnos(false)}
                  className="w-full py-2 text-sm text-[#6543ab] hover:underline"
                >
                  Cargar más...
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#dedee8] flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={enrolling}
            className="h-11 px-6 rounded-lg border border-[#dedee8] font-semibold text-sm text-zinc-700 transition hover:bg-[#f6f6fa] focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleEnroll}
            disabled={enrolling || selectedIds.length === 0}
            className="h-11 px-6 rounded-lg bg-[#6543AB] font-semibold text-sm text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enrolling ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Inscribiendo...
              </>
            ) : (
              `Inscribir ${selectedIds.length} estudiante${selectedIds.length !== 1 ? "s" : ""}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}