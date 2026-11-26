"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseAutoSaveOptions {
  evaluacionId: string;
  preguntaId: string | undefined;
  getRespuesta: () => string;
  getTiempoSegundos: () => number;
  getEventos: () => any[];
  onSave: (respuesta: string, tiempo_segundos: number, eventos: any[]) => void;
  debounceMs?: number;
}

export function useAutoSave({
  evaluacionId,
  preguntaId,
  getRespuesta,
  getTiempoSegundos,
  getEventos,
  onSave,
  debounceMs = 2000,
}: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");
  const savingRef = useRef(false);
  const retryCountRef = useRef(0);

  const save = useCallback(async () => {
    if (!preguntaId || savingRef.current) return;

    const respuesta = getRespuesta();
    const tiempo_segundos = getTiempoSegundos();
    const eventos = getEventos();

    if (respuesta === lastSavedRef.current && eventos.length === 0) return;

    savingRef.current = true;

    try {
      const res = await fetch(`/api/alumno/examenes/${evaluacionId}/respuesta`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pregunta_id: preguntaId,
          respuesta,
          tiempo_segundos,
          eventos,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al guardar");
      }

      lastSavedRef.current = respuesta;
      retryCountRef.current = 0;
    } catch {
      retryCountRef.current += 1;
      if (retryCountRef.current < 3) {
        setTimeout(save, 1000 * retryCountRef.current);
      }
    } finally {
      savingRef.current = false;
    }
  }, [evaluacionId, preguntaId, getRespuesta, getTiempoSegundos, getEventos]);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(save, debounceMs);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [save, debounceMs]);

  const flush = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    save();
  }, [save]);

  return { flush, save };
}