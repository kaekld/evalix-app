"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal, Input, Select, Button } from "@/components/ui";

interface DominioFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { dominio: string; tipo: string; institucion_id: string }) => Promise<void>;
  initialData: { id: string; dominio: string; tipo: string; institucion_id: string } | null;
  instituciones: { id: string; nombre: string }[];
  isLoading: boolean;
  title: string;
}

const TIPOS: { value: string; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "alumno", label: "Alumno" },
  { value: "docente", label: "Docente" },
  { value: "administrador", label: "Administrador" },
];

export default function DominioForm({ isOpen, onClose, onSubmit, initialData, instituciones, isLoading, title }: DominioFormProps) {
  const [dominio, setDominio] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [institucion_id, setInstitucionId] = useState("");
  const [errors, setErrors] = useState<{ dominio?: string; institucion_id?: string }>({});

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isOpen) {
      setDominio(initialData?.dominio || "");
      setTipo(initialData?.tipo || "todos");
      setInstitucionId(initialData?.institucion_id || "");
      setErrors({});
    }
  }, [isOpen, initialData]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const validate = () => {
    const newErrors: { dominio?: string; institucion_id?: string } = {};
    if (!dominio.trim()) newErrors.dominio = "El dominio es obligatorio";
    else if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(dominio.trim())) {
      newErrors.dominio = "Formato de dominio inválido (ej: universidad.edu.mx)";
    }
    if (!institucion_id) newErrors.institucion_id = "Debes seleccionar una institución";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      dominio: dominio.trim().toLowerCase(),
      tipo,
      institucion_id,
    });
  };

  const handleDominioChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDominio(e.target.value);
  }, []);

  const handleTipoChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setTipo(e.target.value);
  }, []);

  const handleInstitucionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setInstitucionId(e.target.value);
  }, []);

  const institucionOptions = instituciones.map((inst) => ({ value: inst.id, label: inst.nombre }));

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
          <Button type="submit" form="dominio-form" loading={isLoading} disabled={isLoading}>
            {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Crear"}
          </Button>
        </>
      }
    >
      <form id="dominio-form" onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Dominio"
          id="dominio"
          name="dominio"
          type="text"
          placeholder="cuautla.tecnm.mx"
          value={dominio}
          onChange={handleDominioChange}
          disabled={isLoading || !!initialData}
          error={errors.dominio}
        />
        <p className="text-xs text-[var(--color-text-muted)]">Ejemplo: universidad.edu.mx (solo el dominio, sin @)</p>

        <Select
          label="Tipo de acceso"
          id="tipo"
          name="tipo"
          value={tipo}
          onChange={handleTipoChange}
          disabled={isLoading}
          options={TIPOS}
        />
        <p className="text-xs text-[var(--color-text-muted)]">
          &ldquo;Todos&rdquo; permite acceso a cualquier rol. Los otros restringen al rol específico.
        </p>

        <Select
          label="Institución"
          id="institucion_id"
          name="institucion_id"
          value={institucion_id}
          onChange={handleInstitucionChange}
          disabled={isLoading}
          placeholder="Selecciona una institución"
          options={institucionOptions}
          error={errors.institucion_id}
        />
      </form>
    </Modal>
  );
}