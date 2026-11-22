"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface User {
  id: string;
  nombre_completo: string;
  correo: string;
  institucion: string | null;
  institucion_id: string | null;
  rol: string;
}

interface PerfilModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function PerfilModal({ isOpen, onClose, user }: PerfilModalProps) {
  const [formData, setFormData] = useState({
    nombre_completo: user?.nombre_completo || "",
    correo: user?.correo || "",
    institucion: user?.institucion || "",
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      // Sincronizar el formulario con el usuario al abrir el modal.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        nombre_completo: user.nombre_completo || "",
        correo: user.correo || "",
        institucion: user.institucion || "",
      });
      setErrors({});
      setApiError("");
      setApiSuccess("");
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.nombre_completo.trim()) newErrors.nombre_completo = "Nombre completo es requerido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setApiSuccess("");
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("/api/auth/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre_completo: formData.nombre_completo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.message || "Error al actualizar perfil");
        return;
      }

      const updatedUser = { ...user!, ...data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setApiSuccess("Perfil actualizado correctamente");
      window.dispatchEvent(new CustomEvent("user-updated", { detail: updatedUser }));
    } catch {
      setApiError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (apiError) setApiError("");
    if (apiSuccess) setApiSuccess("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-4xl rounded-xl bg-white p-8 shadow-xl max-h-[95vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 transition disabled:opacity-50"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5 cursor-pointer" />
        </button>

        <h2 className="text-3xl font-bold text-center text-zinc-900 mt-5">MI PERFIL</h2>
        <p className="mt-2 text-center text-zinc-500">
          Gestiona tu información personal
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {apiError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center" role="alert">
              {apiError}
            </div>
          )}
          {apiSuccess && (
            <div className="p-3 rounded-lg bg-green-50 text-green-600 text-sm text-center" role="alert">
              {apiSuccess}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="nombre_completo" className="block text-sm font-medium text-zinc-700">
              Nombre completo
            </label>
            <input
              id="nombre_completo"
              name="nombre_completo"
              type="text"
              autoComplete="name"
              placeholder="Juan Pérez García"
              value={formData.nombre_completo}
              onChange={handleChange}
              disabled={isLoading}
              className={`h-11 w-full rounded-lg border bg-white px-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 ${errors.nombre_completo
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                : "border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                } disabled:bg-zinc-50`}
            />
            {errors.nombre_completo && <p className="text-sm text-red-500">{errors.nombre_completo}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="correo" className="block text-sm font-medium text-zinc-700">
              Correo electrónico
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              autoComplete="email"
              placeholder="juan.perez@institucion.com"
              value={formData.correo}
              disabled
              className="h-11 w-full rounded-lg border bg-zinc-50 px-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 border-zinc-200 cursor-not-allowed"
            />
            <p className="text-xs text-zinc-400">El correo no se puede modificar</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="institucion" className="block text-sm font-medium text-zinc-700">
              Institución
            </label>
            <input
              id="institucion"
              name="institucion"
              type="text"
              autoComplete="organization"
              placeholder="Universidad Ejemplo"
              value={formData.institucion}
              disabled
              className="h-11 w-full rounded-lg border bg-zinc-50 px-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 border-zinc-200 cursor-not-allowed"
            />
            <p className="text-xs text-zinc-400">La institución no se puede modificar</p>
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
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}