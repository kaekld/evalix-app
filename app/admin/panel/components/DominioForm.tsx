"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

interface DominioFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { dominio: string; tipo: string; institucion_id: string }) => Promise<void>;
  initialData: { id: string; dominio: string; tipo: string; institucion_id: string } | null;
  instituciones: { id: string; nombre: string }[];
  isLoading: boolean;
  title: string;
}

const TIPOS = [
  { value: "todos", label: "Todos" },
  { value: "alumno", label: "Alumno" },
  { value: "docente", label: "Docente" },
  { value: "administrador", label: "Administrador" },
] as const;

export default function DominioForm({ isOpen, onClose, onSubmit, initialData, instituciones, isLoading, title }: DominioFormProps) {
  const [dominio, setDominio] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [institucion_id, setInstitucionId] = useState("");
  const [errors, setErrors] = useState<{ dominio?: string; institucion_id?: string }>({});

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isOpen) {
      setDominio(initialData?.dominio || "");
      setTipo(initialData?.tipo || "todos");
      setInstitucionId(initialData?.institucion_id || "");
      setErrors({});
    }
  }, [isOpen, initialData]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { dominio?: string; institucion_id?: string } = {};
    if (!dominio.trim()) newErrors.dominio = "El dominio es obligatorio";
    else if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(dominio.trim())) {
      newErrors.dominio = "Formato de dominio inválido (ej: universidad.edu.mx)";
    }
    if (!institucion_id) newErrors.institucion_id = "Debes seleccionar una institución";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      dominio: dominio.trim().toLowerCase(),
      tipo,
      institucion_id,
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
            <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-2">
              <label htmlFor="dominio" className="block text-sm font-medium text-zinc-700">
                Dominio
              </label>
              <input
                id="dominio"
                type="text"
                value={dominio}
                onChange={(e) => setDominio(e.target.value)}
                placeholder="cuautla.tecnm.mx"
                disabled={isLoading || !!initialData}
                className={`h-10 w-full rounded-lg border px-4 text-base outline-none transition ${
                  errors.dominio
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                    : "border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10"
                } bg-white text-zinc-900 placeholder:text-zinc-400 ${isLoading || !!initialData ? "bg-zinc-50 cursor-not-allowed" : ""}`}
              />
              {errors.dominio && <p className="text-sm text-red-600">{errors.dominio}</p>}
              <p className="text-xs text-zinc-500">Ejemplo: universidad.edu.mx (solo el dominio, sin @)</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="tipo" className="block text-sm font-medium text-zinc-700">
                Tipo de acceso
              </label>
              <select
                id="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                disabled={isLoading}
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-4 text-base outline-none transition focus:border-zinc-900 focus:ring-zinc-900/10 disabled:bg-zinc-50"
              >
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-500">
                &ldquo;Todos&rdquo; permite acceso a cualquier rol. Los otros restringen al rol específico.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="institucion_id" className="block text-sm font-medium text-zinc-700">
                Institución
              </label>
              <select
                id="institucion_id"
                value={institucion_id}
                onChange={(e) => setInstitucionId(e.target.value)}
                disabled={isLoading}
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-4 text-base outline-none transition focus:border-zinc-900 focus:ring-zinc-900/10 disabled:bg-zinc-50"
              >
                <option value="">Selecciona una institución</option>
                {instituciones.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.nombre}
                  </option>
                ))}
              </select>
              {errors.institucion_id && <p className="text-sm text-red-600">{errors.institucion_id}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 h-10 rounded-lg border border-zinc-300 bg-white font-medium text-sm text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-10 rounded-lg bg-orange-600 font-medium text-sm text-white hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  initialData ? "Actualizar" : "Crear"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}