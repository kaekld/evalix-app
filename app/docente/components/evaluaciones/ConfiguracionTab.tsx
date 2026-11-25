"use client";

import { useState, useCallback } from "react";
import { Evaluacion, Grupo } from "./types";
import { Input, Select, Textarea, Button } from "@/components/ui";
import { Save } from "lucide-react";

interface ConfiguracionTabProps {
  evaluacion: Evaluacion;
  grupos: Grupo[];
  onSave: (data: {
    titulo?: string;
    grupo_id?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    estado?: "pendiente" | "publicada" | "finalizada";
    descripcion?: string;
    tiempo_examen?: number;
    orden_aleatorio?: boolean;
  }) => void;
  isLoading?: boolean;
}

export default function ConfiguracionTab({
  evaluacion,
  grupos,
  onSave,
  isLoading = false,
}: ConfiguracionTabProps) {
  const [titulo, setTitulo] = useState(evaluacion.titulo);
  const [grupoId, setGrupoId] = useState(evaluacion.grupoId);
  const [fecha, setFecha] = useState(evaluacion.fecha);
  const [hora, setHora] = useState(evaluacion.hora || "");
  const [status, setStatus] = useState(evaluacion.status);
  const [descripcion, setDescripcion] = useState(evaluacion.descripcion || "");
  const [tiempoExamen, setTiempoExamen] = useState(evaluacion.tiempoExamen || 60);
  const [ordenAleatorio, setOrdenAleatorio] = useState(evaluacion.ordenAleatorio || false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [saved, setSaved] = useState(false);

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
    setSaved(false);
  }, []);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!titulo.trim()) newErrors.titulo = "Título es requerido";
    if (!grupoId) newErrors.grupoId = "Debe seleccionar un grupo";
    if (!fecha) newErrors.fecha = "Fecha es requerida";
    if (!hora) newErrors.hora = "Hora es requerida";
    if (tiempoExamen < 1) newErrors.tiempo = "Mínimo 1 minuto";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [titulo, grupoId, fecha, hora, tiempoExamen]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      setApiError("");
      setSaved(false);
      try {
        // Convert frontend fields to API expected fields
        const fechaInicio = `${fecha}T${hora}:00`;
        const fechaFin = new Date(fechaInicio);
        fechaFin.setHours(fechaFin.getHours() + 2);

        await onSave({
          titulo: titulo.trim(),
          grupo_id: grupoId,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin.toISOString(),
          estado: status,
          descripcion: descripcion.trim() || undefined,
          tiempo_examen: tiempoExamen,
          orden_aleatorio: ordenAleatorio,
        });
        setSaved(true);
      } catch {
        setApiError("Error al guardar la configuración. Intenta de nuevo.");
      }
    },
    [titulo, grupoId, fecha, hora, status, descripcion, tiempoExamen, ordenAleatorio, onSave, validate]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {apiError && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center" role="alert">
          {apiError}
        </div>
      )}

      {saved && (
        <div className="p-3 rounded-lg bg-green-50 text-green-600 text-sm text-center" role="status">
          Cambios guardados correctamente
        </div>
      )}

      <section className="space-y-4">
        <h3 className="font-semibold text-lg text-[#232334]">Información básica</h3>

        <Input
          label="Título de la evaluación"
          id="titulo"
          type="text"
          placeholder="Ej: Evaluación Unidad 1 - POO"
          value={titulo}
          onChange={(e) => {
            setTitulo(e.target.value);
            clearError("titulo");
          }}
          disabled={isLoading}
          error={errors.titulo}
        />

        <Select
          label="Grupo"
          id="grupoId"
          value={grupoId}
          onChange={(e) => {
            setGrupoId(e.target.value);
            clearError("grupoId");
          }}
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
            onChange={(e) => {
              setFecha(e.target.value);
              clearError("fecha");
            }}
            disabled={isLoading}
            error={errors.fecha}
          />
          <Input
            label="Hora de inicio"
            id="hora"
            type="time"
            value={hora}
            onChange={(e) => {
              setHora(e.target.value);
              clearError("hora");
            }}
            disabled={isLoading}
            error={errors.hora}
          />
        </div>

        <Select
          label="Estado"
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as Evaluacion["status"])}
          disabled={isLoading}
          options={[
            { value: "pendiente", label: "Pendiente (borrador, no visible para alumnos)" },
            { value: "publicada", label: "Publicada (visible para alumnos en horario)" },
            { value: "finalizada", label: "Finalizada (cerrada, solo revisión)" },
          ]}
        />
      </section>

      <section className="space-y-4 pt-6 border-t border-[#dedee8]">
        <h3 className="font-semibold text-lg text-[#232334]">Configuración del examen</h3>

        <Input
          label="Tiempo total del examen (minutos)"
          id="tiempoExamen"
          type="number"
          min="1"
          max="480"
          value={tiempoExamen}
          onChange={(e) => {
            setTiempoExamen(Number(e.target.value) || 0);
            clearError("tiempo");
          }}
          disabled={isLoading}
          error={errors.tiempo}
          hint="Tiempo total que tendrá el alumno para completar el examen completo"
        />

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="ordenAleatorio"
            checked={ordenAleatorio}
            onChange={(e) => setOrdenAleatorio(e.target.checked)}
            disabled={isLoading}
            className="h-4 w-4 rounded border-[#dedee8] text-[#6543ab] focus:ring-[#6543ab]"
          />
          <label htmlFor="ordenAleatorio" className="font-medium text-sm text-[#232334] cursor-pointer">
            Orden aleatorio de preguntas
          </label>
          <span className="text-xs text-[#747487]">Las preguntas se mostrarán en orden aleatorio para cada alumno</span>
        </div>
      </section>

      <section className="space-y-4 pt-6 border-t border-[#dedee8]">
        <h3 className="font-semibold text-lg text-[#232334]">Descripción</h3>
        <Textarea
          label="Descripción / Instrucciones"
          id="descripcion"
          rows={4}
          placeholder="Instrucciones generales para los alumnos..."
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          disabled={isLoading}
        />
      </section>

      <div className="flex justify-end pt-4 border-t border-[#dedee8]">
        <Button type="submit" loading={isLoading} disabled={isLoading} icon={<Save className="h-4 w-4" />}>
          {isLoading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}