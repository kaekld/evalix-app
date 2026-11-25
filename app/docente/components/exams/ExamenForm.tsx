"use client";

import { useState } from "react";
import { Button, Input, Select, Textarea } from "@/components/ui";
import type { CreateExamenDTO, Examen, GrupoOption } from "./types";

interface ExamenFormProps {
  grupos: GrupoOption[];
  onCreated: (examen: Examen) => void;
  onCancel: () => void;
}

const initialState = {
  titulo: "",
  grupoId: "",
  fecha: "",
  hora: "",
  descripcion: "",
  tiempo: 60,
  ordenAleatorio: false,
};

type FormState = typeof initialState;

export default function ExamenForm({ grupos, onCreated, onCancel }: ExamenFormProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof FormState,>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.titulo.trim() || !form.grupoId || !form.fecha || !form.hora) {
      setError("Título, grupo, fecha y hora son obligatorios.");
      return;
    }
    setSubmitting(true);
    try {
      const inicio = new Date(`${form.fecha}T${form.hora}:00`);
      const fin = new Date(inicio.getTime() + form.tiempo * 60_000);
      const payload: CreateExamenDTO = {
        titulo: form.titulo.trim(),
        grupo_id: form.grupoId,
        fecha_inicio: inicio.toISOString(),
        fecha_fin: fin.toISOString(),
        descripcion: form.descripcion.trim() || undefined,
        tiempo_examen: form.tiempo,
        orden_aleatorio: form.ordenAleatorio,
      };
      const res = await fetch("/api/docente/examenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al crear el examen");
      onCreated(data as Examen);
      setForm(initialState);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear el examen");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}
      <Input label="Título" placeholder="Ej. Examen de Unidad 1" value={form.titulo}
        onChange={(e) => update("titulo", e.target.value)} disabled={submitting} />
      <Select label="Grupo" placeholder="Selecciona un grupo" value={form.grupoId}
        onChange={(e) => update("grupoId", e.target.value)} disabled={submitting}
        options={grupos.map((g) => ({ value: g.id, label: `${g.nombre} · ${g.codigo}` }))} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Fecha" type="date" value={form.fecha}
          onChange={(e) => update("fecha", e.target.value)} disabled={submitting} />
        <Input label="Hora" type="time" value={form.hora}
          onChange={(e) => update("hora", e.target.value)} disabled={submitting} />
      </div>
      <Input label="Duración (min)" type="number" min={1} value={form.tiempo}
        onChange={(e) => update("tiempo", Number(e.target.value))} disabled={submitting} />
      <Textarea label="Descripción (opcional)" rows={2} value={form.descripcion}
        onChange={(e) => update("descripcion", e.target.value)} disabled={submitting} />
      <label className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
        <input type="checkbox" checked={form.ordenAleatorio}
          onChange={(e) => update("ordenAleatorio", e.target.checked)} disabled={submitting}
          className="h-4 w-4 rounded border-[var(--color-border)]" />
        Orden aleatorio de preguntas
      </label>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>Crear examen</Button>
      </div>
    </form>
  );
}
