"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Group {
  id: number;
  name: string;
  code: string;
  subject: string;
  studentsCount: number;
  examsCount: number;
  createdAt: string;
  expanded: boolean;
}

interface CrearGrupoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Partial<Group>) => void;
}

export default function CrearGrupoModal({ isOpen, onClose, onCreate }: CrearGrupoModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    subject: "",
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: "", code: "", subject: "" });
      setErrors({});
      setApiError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.name.trim()) newErrors.name = "Nombre del grupo es requerido";
    if (!formData.code.trim()) newErrors.code = "Código del grupo es requerido";
    if (!formData.subject.trim()) newErrors.subject = "Materia es requerida";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onCreate(formData);
      onClose();
    } catch {
      setApiError("Error al crear el grupo. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          onClick={onClose}
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
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700">
              Nombre del grupo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="off"
              placeholder="Programación Orientada a Objetos"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              className={`h-11 w-full rounded-lg border bg-white px-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 ${errors.name
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                : "border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                } disabled:bg-zinc-50`}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="code" className="block text-sm font-medium text-zinc-700">
              Código del grupo
            </label>
            <input
              id="code"
              name="code"
              type="text"
              autoComplete="off"
              placeholder="POO-2026-A"
              value={formData.code}
              onChange={handleChange}
              disabled={isLoading}
              className={`h-11 w-full rounded-lg border bg-white px-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 ${errors.code
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                : "border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                } disabled:bg-zinc-50`}
            />
            {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="block text-sm font-medium text-zinc-700">
              Materia
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              disabled={isLoading}
              className={`h-11 w-full rounded-lg border bg-white px-4 text-base text-zinc-900 outline-none transition ${errors.subject
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
            {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
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