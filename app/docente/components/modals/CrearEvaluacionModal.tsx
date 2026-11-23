"use client";

import { useState, useCallback } from "react";
import { Modal, Input, Select, Textarea, Button } from "@/components/ui";

interface Grupo {
  id: string;
  nombre: string;
  codigo: string;
}

interface CrearEvaluacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { titulo: string; grupoId: string; fecha: string; hora: string; descripcion?: string }) => void;
  grupos: Grupo[];
}

export default function CrearEvaluacionModal({ isOpen, onClose, onCreate, grupos }: CrearEvaluacionModalProps) {
  const [titulo, setTitulo] = useState("");
  const [grupoId, setGrupoId] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
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

  const handleTituloChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitulo(e.target.value);
    clearError("titulo");
  }, [clearError]);

  const handleGrupoChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setGrupoId(e.target.value);
    clearError("grupoId");
  }, [clearError]);

  const handleFechaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFecha(e.target.value);
    clearError("fecha");
  }, [clearError]);

  const handleHoraChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHora(e.target.value);
    clearError("hora");
  }, [clearError]);

  const handleDescripcionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescripcion(e.target.value);
  }, []);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!titulo.trim()) newErrors.titulo = "Título de la evaluación es requerido";
    if (!grupoId) newErrors.grupoId = "Debe seleccionar un grupo";
    if (!fecha) newErrors.fecha = "Fecha es requerida";
    if (!hora) newErrors.hora = "Hora es requerida";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [titulo, grupoId, fecha, hora]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await onCreate({
        titulo: titulo.trim(),
        grupoId,
        fecha,
        hora,
        descripcion: descripcion.trim() || undefined,
      });
      setTitulo("");
      setGrupoId("");
      setFecha("");
      setHora("");
      setDescripcion("");
      setErrors({});
      onClose();
    } catch {
      setApiError("Error al crear la evaluación. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, [titulo, grupoId, fecha, hora, descripcion, onCreate, validate, onClose]);

  const handleClose = useCallback(() => {
    setTitulo("");
    setGrupoId("");
    setFecha("");
    setHora("");
    setDescripcion("");
    setErrors({});
    setApiError("");
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="CREAR NUEVA EVALUACIÓN"
      description="Completa la información de la evaluación"
      size="md"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" form="crear-evaluacion-form" loading={isLoading} disabled={isLoading}>
            {isLoading ? "Creando..." : "Crear evaluación"}
          </Button>
        </>
      }
    >
      <form id="crear-evaluacion-form" onSubmit={handleSubmit} className="space-y-4">
        {apiError && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center" role="alert">
            {apiError}
          </div>
        )}

        <Input
          label="Título de la evaluación"
          id="titulo"
          type="text"
          autoComplete="off"
          placeholder="Ej: Evaluación Unidad 1 - POO"
          value={titulo}
          onChange={handleTituloChange}
          disabled={isLoading}
          error={errors.titulo}
        />

        <Select
          label="Grupo"
          id="grupoId"
          value={grupoId}
          onChange={handleGrupoChange}
          disabled={isLoading}
          placeholder="Selecciona un grupo"
          options={grupos.map((g) => ({ value: g.id, label: `${g.nombre} (${g.codigo})` }))}
          error={errors.grupoId}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Fecha"
            id="fecha"
            type="date"
            value={fecha}
            onChange={handleFechaChange}
            disabled={isLoading}
            error={errors.fecha}
          />
          <Input
            label="Hora"
            id="hora"
            type="time"
            value={hora}
            onChange={handleHoraChange}
            disabled={isLoading}
            error={errors.hora}
          />
        </div>

        <Textarea
          label="Descripción (opcional)"
          id="descripcion"
          rows={3}
          placeholder="Instrucciones o detalles de la evaluación..."
          value={descripcion}
          onChange={handleDescripcionChange}
          disabled={isLoading}
        />
      </form>
    </Modal>
  );
}