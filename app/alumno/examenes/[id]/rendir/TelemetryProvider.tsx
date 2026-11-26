"use client";

import { createContext, useContext, useCallback, ReactNode, useMemo, useRef, useEffect } from "react";
import { useTelemetry, useWindowTelemetry, useMonacoTelemetry } from "./hooks/useTelemetry";
import { useExamContext } from "./ExamRendirClient";
import type { TelemetryEvent } from "./types";

interface TelemetryContextValue {
  addEvent: (event: TelemetryEvent) => void;
  monacoHandlers: ReturnType<typeof useMonacoTelemetry>;
}

const TelemetryContext = createContext<TelemetryContextValue | null>(null);

export function useTelemetryContext() {
  const ctx = useContext(TelemetryContext);
  if (!ctx) throw new Error("useTelemetryContext must be used within TelemetryProvider");
  return ctx;
}

export function TelemetryProvider({ children, evaluacionId }: { children: ReactNode; evaluacionId: string }) {
  const { currentIndex, preguntas, addTelemetryEvent: contextAddTelemetryEvent } = useExamContext();
  const { addEvent: telemetryAddEvent, flush } = useTelemetry({ evaluacionId });

  const pendingEventsRef = useRef<TelemetryEvent[]>([]);

  const addEvent = useCallback(
    (event: TelemetryEvent) => {
      pendingEventsRef.current.push(event);
      telemetryAddEvent(event);
      contextAddTelemetryEvent(event);
    },
    [telemetryAddEvent, contextAddTelemetryEvent]
  );

  const preguntaId = preguntas[currentIndex]?.id;

  const monacoHandlers = useMonacoTelemetry(addEvent, preguntaId);
  useWindowTelemetry(addEvent, preguntaId);

  useEffect(() => {
    return () => {
      flush();
    };
  }, [flush]);

  const value = useMemo(
    () => ({
      addEvent,
      monacoHandlers,
    }),
    [addEvent, monacoHandlers]
  );

  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
}