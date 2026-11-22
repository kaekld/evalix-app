"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

interface InstitucionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { nombre: string; dominio: string }) => Promise<void>;
  initialData: { id: string; nombre: string; dominio: string } | null;
  isLoading: boolean;
  title: string;
}

export default function InstitucionForm({ isOpen, onClose, onSubmit, initialData, isLoading, title }: InstitucionFormProps) {
  const [nombre, setNombre] = useState("");
  const [dominio, setDominio] = useState("");
  const [errors, setErrors] = useState<{ nombre?: string; dominio?: string }>({});

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isOpen) {
      setNombre(initialData?.nombre || "");
      setDominio(initialData?.dominio || "");
      setErrors({});
    }
  }, [isOpen, initialData]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { nombre?: string; dominio?: string } = {};
    if (!nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!dominio.trim()) newErrors.dominio = "El dominio es obligatorio";
    else if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(dominio.trim())) {
      newErrors.dominio = "Formato de dominio inválido (ej: universidad.edu.mx)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ nombre: nombre.trim(), dominio: dominio.trim().toLowerCase() });
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
              <label htmlFor="nombre" className="block text-sm font-medium text-zinc-700">
                Nombre de la institución
              </label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Instituto Tecnológico de México Campus Cuautla"
                disabled={isLoading}
                className={`h-10 w-full rounded-lg border px-4 text-base outline-none transition ${
                  errors.nombre
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                    : "border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10"
                } bg-white text-zinc-900 placeholder:text-zinc-400 disabled:bg-zinc-50`}
              />
              {errors.nombre && <p className="text-sm text-red-600">{errors.nombre}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="dominio" className="block text-sm font-medium text-zinc-700">
                Dominio institucional
              </label>
              <input
                id="dominio"
                type="text"
                value={dominio}
                onChange={(e) => setDominio(e.target.value)}
                placeholder="cuautla.tecnm.mx"
                disabled={isLoading}
                className={`h-10 w-full rounded-lg border px-4 text-base outline-none transition ${
                  errors.dominio
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                    : "border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10"
                } bg-white text-zinc-900 placeholder:text-zinc-400 disabled:bg-zinc-50`}
              />
              {errors.dominio && <p className="text-sm text-red-600">{errors.dominio}</p>}
              <p className="text-xs text-zinc-500">Ejemplo: universidad.edu.mx (solo el dominio, sin @)</p>
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