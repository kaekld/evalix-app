"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Grupo {
  id: string;
  nombre: string;
  codigo: string;
  materia: string;
  descripcion: string | null;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
  institucion_id: string;
  estudiantes_count: number;
}

interface EditarGrupoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: { nombre: string; descripcion: string; activo: boolean }) => void;
  grupo: Grupo | null;
}

export default function EditarGrupoModal({ isOpen, onClose, onUpdate, grupo }: EditarGrupoModalProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    activo: true,
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Populate form when grupo changes
  useEffect(() => {
    if (grupo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        nombre: grupo.nombre,
        descripcion: grupo.descripcion || "",
        activo: grupo.activo,
      });
      setErrors({});
      setApiError("");
    }
  }, [grupo]);

  const validate = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !grupo) return;

    setIsLoading(true);
    setApiError("");

    try {
      await onUpdate(grupo.id, {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || "",
        activo: formData.activo,
      });
      onClose();
    } catch {
      setApiError("Error al actualizar el grupo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setApiError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#dedee8]">
          <h2 className="text-lg font-semibold text-zinc-900">Editar grupo</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-[#f6f6fa] transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {apiError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {apiError}
            </div>
          )}

          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-zinc-700 mb-1">
              Nombre del grupo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.nombre ? "border-red-500" : "border-[#dedee8]"
              } focus:outline-none focus:ring-2 focus:ring-[#6543ab]/20 focus:border-[#6543ab] transition-colors`}
              placeholder="Ej: Programación Orientada a Objetos"
              disabled={isLoading}
            />
            {errors.nombre && <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>}
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-zinc-700 mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[#dedee8] focus:outline-none focus:ring-2 focus:ring-[#6543ab]/20 focus:border-[#6543ab] transition-colors"
              placeholder="Descripción opcional del grupo..."
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="activo"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              className="h-4 w-4 rounded border-[#dedee8] text-[#6543ab] focus:ring-2 focus:ring-[#6543ab]/20"
              disabled={isLoading}
            />
            <label htmlFor="activo" className="text-sm text-zinc-700 cursor-pointer">
              Grupo activo
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 h-11 px-6 rounded-lg border border-[#dedee8] font-semibold text-sm leading-relaxed text-zinc-700 transition hover:bg-[#f6f6fa] focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 px-6 rounded-lg bg-[#6543AB] font-semibold text-sm leading-relaxed text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}