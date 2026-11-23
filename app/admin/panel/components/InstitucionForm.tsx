"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal, Input, Button } from "@/components/ui";

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

  const handleNombreChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNombre(e.target.value);
  }, []);

  const handleDominioChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDominio(e.target.value);
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" form="institucion-form" loading={isLoading} disabled={isLoading}>
            {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Crear"}
          </Button>
        </>
      }
    >
      <form id="institucion-form" onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Nombre de la institución"
          id="nombre"
          name="nombre"
          type="text"
          placeholder="Instituto Tecnológico de México Campus Cuautla"
          value={nombre}
          onChange={handleNombreChange}
          disabled={isLoading}
          error={errors.nombre}
        />

        <div className="space-y-2">
          <Input
            label="Dominio institucional"
            id="dominio"
            name="dominio"
            type="text"
            placeholder="cuautla.tecnm.mx"
            value={dominio}
            onChange={handleDominioChange}
            disabled={isLoading}
            error={errors.dominio}
          />
          <p className="text-xs text-[var(--color-text-muted)]">Ejemplo: universidad.edu.mx (solo el dominio, sin @)</p>
        </div>
      </form>
    </Modal>
  );
}