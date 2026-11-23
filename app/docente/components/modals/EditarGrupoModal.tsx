"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal, Input, Textarea, Button } from "@/components/ui";

import { type DocenteGroup } from "@/components/ui";

interface EditarGrupoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: { nombre: string; descripcion: string; activo: boolean }) => void;
  grupo: DocenteGroup | null;
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
        activo: grupo.activo ?? true,
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
      await onUpdate(String(grupo.id), {
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

  const handleNombreChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, nombre: e.target.value }));
  }, []);

  const handleDescripcionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, descripcion: e.target.value }));
  }, []);

  const handleActivoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, activo: e.target.checked }));
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar grupo"
      size="md"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" form="editar-grupo-form" loading={isLoading} disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </>
      }
    >
      <form id="editar-grupo-form" onSubmit={handleSubmit} className="space-y-4">
        {apiError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {apiError}
          </div>
        )}

        <Input
          label="Nombre del grupo"
          id="nombre"
          name="nombre"
          type="text"
          placeholder="Ej: Programación Orientada a Objetos"
          value={formData.nombre}
          onChange={handleNombreChange}
          disabled={isLoading}
          error={errors.nombre}
          required
        />

        <Textarea
          label="Descripción"
          id="descripcion"
          name="descripcion"
          rows={3}
          placeholder="Descripción opcional del grupo..."
          value={formData.descripcion}
          onChange={handleDescripcionChange}
          disabled={isLoading}
        />

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="activo"
            name="activo"
            checked={formData.activo}
            onChange={handleActivoChange}
            className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-focus-ring)]/20"
            disabled={isLoading}
          />
          <label htmlFor="activo" className="text-sm text-[var(--color-text-primary)] cursor-pointer">
            Grupo activo
          </label>
        </div>
      </form>
    </Modal>
  );
}