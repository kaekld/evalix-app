"use client";

import { useCallback, useRef, useEffect } from "react";
import type { TelemetryEvent } from "../types";

const CRITICAL_EVENTS = ["paste", "fullscreen_exit", "connection_lost", "copy_attempt", "devtools_open"];
const BATCH_INTERVAL = 10000; // 10 segundos
const MAX_BATCH_SIZE = 50;

interface UseTelemetryOptions {
  evaluacionId: string;
}

interface UseTelemetryReturn {
  addEvent: (event: TelemetryEvent) => void;
  flush: () => void;
}

export function useTelemetry({ evaluacionId }: UseTelemetryOptions): UseTelemetryReturn {
  const queueRef = useRef<TelemetryEvent[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sendingRef = useRef(false);

  const sendBatch = useCallback(async () => {
    if (sendingRef.current || queueRef.current.length === 0) return;

    const batch = queueRef.current.splice(0, MAX_BATCH_SIZE);
    sendingRef.current = true;

    try {
      await fetch(`/api/alumno/examenes/${evaluacionId}/telemetria`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventos: batch }),
        keepalive: true,
      });
    } catch {
      queueRef.current.unshift(...batch);
    } finally {
      sendingRef.current = false;
    }
  }, [evaluacionId]);

  const addEvent = useCallback((event: TelemetryEvent) => {
    queueRef.current.push(event);

    if (CRITICAL_EVENTS.includes(event.type)) {
      sendBatch();
    }
  }, [sendBatch]);

  const flush = useCallback(() => {
    sendBatch();
  }, [sendBatch]);

  useEffect(() => {
    intervalRef.current = setInterval(sendBatch, BATCH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      sendBatch();
    };
  }, [sendBatch]);

  return { addEvent, flush };
}

export function useWindowTelemetry(addEvent: (event: TelemetryEvent) => void, preguntaId: string | undefined) {
  useEffect(() => {
    if (!preguntaId) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        addEvent({ type: "focus_lost", timestamp: new Date().toISOString(), pregunta_id: preguntaId });
      } else {
        addEvent({ type: "tab_switch", timestamp: new Date().toISOString(), pregunta_id: preguntaId });
      }
    };

    const handleBeforeUnload = () => {
      addEvent({ type: "connection_lost", timestamp: new Date().toISOString(), pregunta_id: preguntaId });
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        addEvent({ type: "fullscreen_exit", timestamp: new Date().toISOString(), pregunta_id: preguntaId });
      }
    };

    const handleOnline = () => {
      addEvent({ type: "network_error", timestamp: new Date().toISOString(), pregunta_id: preguntaId, data: { online: true } });
    };

    const handleOffline = () => {
      addEvent({ type: "connection_lost", timestamp: new Date().toISOString(), pregunta_id: preguntaId });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [addEvent, preguntaId]);
}

export function useMonacoTelemetry(addEvent: (event: TelemetryEvent) => void, preguntaId: string | undefined) {
  const lastChangeRef = useRef<number>(Date.now());
  const charsTypedRef = useRef(0);
  const pasteDetectedRef = useRef(false);

  useEffect(() => {
    if (!preguntaId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        addEvent({ type: "copy_attempt", timestamp: new Date().toISOString(), pregunta_id: preguntaId });
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      addEvent({ type: "right_click", timestamp: new Date().toISOString(), pregunta_id: preguntaId });
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [addEvent, preguntaId]);

  const onDidChangeModelContent = useCallback(() => {
    if (!preguntaId) return;

    const now = Date.now();
    const timeSinceLastChange = now - lastChangeRef.current;
    charsTypedRef.current += 1;

    if (timeSinceLastChange > 30000 && charsTypedRef.current > 0) {
      addEvent({
        type: "typing_anomaly",
        timestamp: new Date().toISOString(),
        pregunta_id: preguntaId,
        data: { pausa_larga_ms: timeSinceLastChange, chars_desde_pausa: charsTypedRef.current },
      });
      charsTypedRef.current = 0;
    } else if (charsTypedRef.current > 100 && timeSinceLastChange < 1000) {
      addEvent({
        type: "typing_anomaly",
        timestamp: new Date().toISOString(),
        pregunta_id: preguntaId,
        data: { burst_chars: charsTypedRef.current, duracion_ms: timeSinceLastChange },
      });
      charsTypedRef.current = 0;
    }

    lastChangeRef.current = now;
  }, [addEvent, preguntaId]);

  const onPaste = useCallback((text: string) => {
    if (!preguntaId) return;
    pasteDetectedRef.current = true;
    addEvent({
      type: "paste",
      timestamp: new Date().toISOString(),
      pregunta_id: preguntaId,
      data: { longitud: text.length, preview: text.slice(0, 200) },
    });
  }, [addEvent, preguntaId]);

  return { onDidChangeModelContent, onPaste };
}