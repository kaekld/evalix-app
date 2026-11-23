"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal, Input, Button } from "@/components/ui";

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
      title="MI PERFIL"
      description="Gestiona tu información personal"
      size="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" form="perfil-form" loading={isLoading} disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </>
      }
    >
      <form id="perfil-form" onSubmit={handleSubmit} className="space-y-4">
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

        <Input
          label="Nombre completo"
          id="nombre_completo"
          name="nombre_completo"
          type="text"
          autoComplete="name"
          placeholder="Juan Pérez García"
          value={formData.nombre_completo}
          onChange={handleChange}
          disabled={isLoading}
          error={errors.nombre_completo}
        />

        <Input
          label="Correo electrónico"
          id="correo"
          name="correo"
          type="email"
          autoComplete="email"
          placeholder="juan.perez@institucion.com"
          value={formData.correo}
          disabled
          className="bg-[var(--color-skeleton)] cursor-not-allowed"
        />
        <p className="text-xs text-[var(--color-text-muted)]">El correo no se puede modificar</p>

        <Input
          label="Institución"
          id="institucion"
          name="institucion"
          type="text"
          autoComplete="organization"
          placeholder="Universidad Ejemplo"
          value={formData.institucion}
          disabled
          className="bg-[var(--color-skeleton)] cursor-not-allowed"
        />
        <p className="text-xs text-[var(--color-text-muted)]">La institución no se puede modificar</p>
      </form>
    </Modal>
  );
}