"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseExamTimerOptions {
  tiempoRestante: number;
  onTick?: (segundos: number) => void;
  onTimeUp: () => void;
  enabled: boolean;
}

export function useExamTimer({
  tiempoRestante,
  onTick,
  onTimeUp,
  enabled,
}: UseExamTimerOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const tiempoRef = useRef(tiempoRestante);
  const enabledRef = useRef(enabled);
  const onTimeUpRef = useRef(onTimeUp);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    tiempoRef.current = tiempoRestante;
  }, [tiempoRestante]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    if (!enabledRef.current || tiempoRef.current <= 0) return;

    const tick = () => {
      if (tiempoRef.current <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onTimeUpRef.current();
        return;
      }

      tiempoRef.current -= 1;
      onTickRef.current?.(tiempoRef.current);
    };

    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled]);

  const reset = useCallback((nuevoTiempo: number) => {
    tiempoRef.current = nuevoTiempo;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (enabledRef.current && nuevoTiempo > 0) {
      intervalRef.current = setInterval(() => {
        if (tiempoRef.current <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onTimeUpRef.current();
          return;
        }
        tiempoRef.current -= 1;
        onTickRef.current?.(tiempoRef.current);
      }, 1000);
    }
  }, []);

  return { reset };
}