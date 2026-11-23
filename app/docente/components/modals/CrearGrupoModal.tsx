"use client";

import { useState, useCallback } from "react";
import { Modal, Input, Select, Textarea, Button } from "@/components/ui";

interface CrearGrupoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { nombre: string; codigo: string; categoria: string; descripcion?: string }) => void;
}

const categoriaOptions = [
  { value: "Programación", label: "Programación" },
  { value: "Sistemas", label: "Sistemas" },
  { value: "Estructuras de Datos", label: "Estructuras de Datos" },
  { value: "Bases de Datos", label: "Bases de Datos" },
  { value: "Redes", label: "Redes" },
  { value: "Inteligencia Artificial", label: "Inteligencia Artificial" },
  { value: "Matemáticas", label: "Matemáticas" },
  { value: "Física", label: "Física" },
  { value: "Química", label: "Química" },
  { value: "Otros", label: "Otros" },
];

export default function CrearGrupoModal({ isOpen, onClose, onCreate }: CrearGrupoModalProps) {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      if (prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
    setApiError("");
  }, []);

  const handleNombreChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNombre(e.target.value);
    clearError("nombre");
  }, [clearError]);

  const handleCodigoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCodigo(e.target.value);
    clearError("codigo");
  }, [clearError]);

  const handleCategoriaChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoria(e.target.value);
    clearError("categoria");
  }, [clearError]);

  const handleDescripcionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescripcion(e.target.value);
  }, []);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!nombre.trim()) newErrors.nombre = "Nombre del grupo es requerido";
    if (!codigo.trim()) newErrors.codigo = "Código del grupo es requerido";
    if (!categoria.trim()) newErrors.categoria = "Categoría es requerida";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [nombre, codigo, categoria]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await onCreate({
        nombre: nombre.trim(),
        codigo: codigo.trim().toUpperCase(),
        categoria: categoria.trim(),
        descripcion: descripcion.trim() || undefined,
      });
      setNombre("");
      setCodigo("");
      setCategoria("");
      setDescripcion("");
      setErrors({});
      onClose();
    } catch {
      setApiError("Error al crear el grupo. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, [nombre, codigo, categoria, descripcion, onCreate, validate]);

  const handleClose = useCallback(() => {
    setNombre("");
    setCodigo("");
    setCategoria("");
    setDescripcion("");
    setErrors({});
    setApiError("");
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="CREAR NUEVO GRUPO"
      description="Completa la información del grupo"
      size="md"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" form="crear-grupo-form" loading={isLoading} disabled={isLoading}>
            {isLoading ? "Creando..." : "Crear grupo"}
          </Button>
        </>
      }
    >
      <form id="crear-grupo-form" onSubmit={handleSubmit} className="space-y-4">
        {apiError && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center" role="alert">
            {apiError}
          </div>
        )}

        <Input
          label="Nombre del grupo"
          id="nombre"
          type="text"
          autoComplete="off"
          placeholder="Programación Orientada a Objetos"
          value={nombre}
          onChange={handleNombreChange}
          disabled={isLoading}
          error={errors.nombre}
        />

        <Input
          label="Código del grupo"
          id="codigo"
          type="text"
          autoComplete="off"
          placeholder="POO-2026-A"
          value={codigo}
          onChange={handleCodigoChange}
          disabled={isLoading}
          error={errors.codigo}
        />

        <Select
          label="Categoría"
          id="categoria"
          value={categoria}
          onChange={handleCategoriaChange}
          disabled={isLoading}
          placeholder="Selecciona una categoría"
          options={categoriaOptions}
          error={errors.categoria}
        />

        <Textarea
          label="Descripción (opcional)"
          id="descripcion"
          rows={3}
          placeholder="Descripción del grupo..."
          value={descripcion}
          onChange={handleDescripcionChange}
          disabled={isLoading}
        />
      </form>
    </Modal>
  );
}