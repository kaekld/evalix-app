"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface CrearGrupoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { nombre: string; codigo: string; materia: string; descripcion?: string }) => void;
}

const initialFormData = {
  nombre: "",
  codigo: "",
  materia: "",
  descripcion: "",
};

export default function CrearGrupoModal({ isOpen, onClose, onCreate }: CrearGrupoModalProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setApiError("");
  };

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.nombre.trim()) newErrors.nombre = "Nombre del grupo es requerido";
    if (!formData.codigo.trim()) newErrors.codigo = "Código del grupo es requerido";
    if (!formData.materia.trim()) newErrors.materia = "Materia es requerida";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onCreate({
        nombre: formData.nombre.trim(),
        codigo: formData.codigo.trim().toUpperCase(),
        materia: formData.materia.trim(),
        descripcion: formData.descripcion.trim() || undefined,
      });
      resetForm();
      onClose();
    } catch {
      setApiError("Error al crear el grupo. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (apiError) setApiError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl max-h-[95vh] overflow-y-auto">
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading}
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 transition disabled:opacity-50"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5 cursor-pointer" />
        </button>

        <h2 className="text-3xl font-bold text-center text-zinc-900 mt-5">CREAR NUEVO GRUPO</h2>
        <p className="mt-2 text-center text-zinc-500">
          Completa la información del grupo
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {apiError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center" role="alert">
              {apiError}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="nombre" className="block text-sm font-medium text-zinc-700">
              Nombre del grupo
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              autoComplete="off"
              placeholder="Programación Orientada a Objetos"
              value={formData.nombre}
              onChange={handleChange}
              disabled={isLoading}
              className={`h-11 w-full rounded-lg border bg-white px-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 ${errors.nombre
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                : "border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                } disabled:bg-zinc-50`}
            />
            {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="codigo" className="block text-sm font-medium text-zinc-700">
              Código del grupo
            </label>
            <input
              id="codigo"
              name="codigo"
              type="text"
              autoComplete="off"
              placeholder="POO-2026-A"
              value={formData.codigo}
              onChange={handleChange}
              disabled={isLoading}
              className={`h-11 w-full rounded-lg border bg-white px-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 ${errors.codigo
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                : "border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                } disabled:bg-zinc-50`}
            />
            {errors.codigo && <p className="text-sm text-red-500">{errors.codigo}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="materia" className="block text-sm font-medium text-zinc-700">
              Materia
            </label>
            <select
              id="materia"
              name="materia"
              value={formData.materia}
              onChange={handleChange}
              disabled={isLoading}
              className={`h-11 w-full rounded-lg border bg-white px-4 text-base text-zinc-900 outline-none transition ${errors.materia
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                : "border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                } disabled:bg-zinc-50`}
            >
              <option value="">Selecciona una materia</option>
              <option value="Programación">Programación</option>
              <option value="Sistemas">Sistemas</option>
              <option value="Estructuras de Datos">Estructuras de Datos</option>
              <option value="Bases de Datos">Bases de Datos</option>
              <option value="Redes">Redes</option>
              <option value="Inteligencia Artificial">Inteligencia Artificial</option>
            </select>
            {errors.materia && <p className="text-sm text-red-500">{errors.materia}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="descripcion" className="block text-sm font-medium text-zinc-700">
              Descripción (opcional)
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={3}
              value={formData.descripcion}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Descripción del grupo..."
              className={`w-full rounded-lg border bg-white px-4 py-3 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 resize-none ${"border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 disabled:bg-zinc-50"}`}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 h-11 rounded-lg border border-zinc-200 bg-white font-semibold text-zinc-700 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 items-center justify-center rounded-lg bg-[#6543AB] font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creando..." : "Crear grupo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}