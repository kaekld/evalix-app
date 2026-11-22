"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface CambiarPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CambiarPasswordModal({ isOpen, onClose }: CambiarPasswordModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reiniciar el formulario al abrir el modal es intencional.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
      setApiError("");
      setApiSuccess("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.currentPassword) newErrors.currentPassword = "Contraseña actual es requerida";
    if (!formData.newPassword) newErrors.newPassword = "Nueva contraseña es requerida";
    else if (formData.newPassword.length < 8) newErrors.newPassword = "Mínimo 8 caracteres";
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
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
      const res = await fetch("/api/auth/password/change", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.message || "Error al cambiar contraseña");
        return;
      }

      setApiSuccess("Contraseña cambiada correctamente. Inicia sesión de nuevo.");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });

      setTimeout(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }, 2000);
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

        <h2 className="text-3xl font-bold text-center text-zinc-900 mt-5">CAMBIAR CONTRASEÑA</h2>
        <p className="mt-2 text-center text-zinc-500">
          Ingresa tu contraseña actual y la nueva
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
            <label htmlFor="currentPassword" className="block text-sm font-medium text-zinc-700">
              Contraseña actual
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                name="currentPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={formData.currentPassword}
                onChange={handleChange}
                disabled={isLoading}
                className={`h-11 w-full rounded-lg border bg-white pl-4 pr-12 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 ${errors.currentPassword
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                  : "border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                  } disabled:bg-zinc-50`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-500 hover:text-zinc-700 transition cursor-pointer disabled:opacity-50"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {errors.currentPassword && <p className="text-sm text-red-500">{errors.currentPassword}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-700">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={handleChange}
                disabled={isLoading}
                className={`h-11 w-full rounded-lg border bg-white pl-4 pr-12 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 ${errors.newPassword
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                  : "border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                  } disabled:bg-zinc-50`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-500 hover:text-zinc-700 transition cursor-pointer disabled:opacity-50"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700">
              Confirmar nueva contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              className={`h-11 w-full rounded-lg border bg-white px-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 ${errors.confirmPassword
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                : "border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                } disabled:bg-zinc-50`}
            />
            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
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
              {isLoading ? "Cambiando..." : "Cambiar contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}