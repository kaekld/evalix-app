"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal, Input, Button } from "@/components/ui";

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

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => {
        if (prev[name as keyof typeof prev]) {
          const next = { ...prev };
          delete next[name as keyof typeof next];
          return next;
        }
        return prev;
      });
      setApiError((prev) => (prev ? "" : prev));
      setApiSuccess((prev) => (prev ? "" : prev));
    },
    []
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CAMBIAR CONTRASEÑA"
      description="Ingresa tu contraseña actual y la nueva"
      size="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" form="cambiar-password-form" loading={isLoading} disabled={isLoading}>
            {isLoading ? "Cambiando..." : "Cambiar contraseña"}
          </Button>
        </>
      }
    >
      <form id="cambiar-password-form" onSubmit={handleSubmit} className="space-y-4">
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
          <label htmlFor="currentPassword" className="block text-sm font-medium text-[var(--color-text-primary)]">
            Contraseña actual
          </label>
          <div className="relative">
            <Input
              id="currentPassword"
              name="currentPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={formData.currentPassword}
              onChange={handleChange}
              disabled={isLoading}
              className="pr-12"
              error={errors.currentPassword}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition cursor-pointer disabled:opacity-50"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="newPassword" className="block text-sm font-medium text-[var(--color-text-primary)]">
            Nueva contraseña
          </label>
          <div className="relative">
            <Input
              id="newPassword"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={formData.newPassword}
              onChange={handleChange}
              disabled={isLoading}
              className="pr-12"
              error={errors.newPassword}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition cursor-pointer disabled:opacity-50"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>

        <Input
          label="Confirmar nueva contraseña"
          id="confirmPassword"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={isLoading}
          error={errors.confirmPassword}
        />
      </form>
    </Modal>
  );
}