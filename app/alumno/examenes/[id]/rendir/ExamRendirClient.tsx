"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { BaseHeader } from "@/components/ui";
import { ExamHeader } from "./ExamHeader";
import { QuestionView } from "./QuestionView";
import { NavigationBar } from "./NavigationBar";
import { TelemetryProvider } from "./TelemetryProvider";
import { useExamTimer } from "./hooks/useExamTimer";
import { useAutoSave } from "./hooks/useAutoSave";
import type { IniciarResponse, Pregunta, Intento, TelemetryEvent } from "./types";

interface ExamRendirClientProps {
  initialData: IniciarResponse | null;
  error: string | null;
  evaluacionId: string;
}

interface ExamContextValue {
  evaluacionId: string;
  evaluacion: IniciarResponse["evaluacion"];
  preguntas: Pregunta[];
  intento: Intento;
  setIntento: React.Dispatch<React.SetStateAction<Intento>>;
  tiempoRestante: number;
  setTiempoRestante: React.Dispatch<React.SetStateAction<number>>;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  isFinalizing: boolean;
  addTelemetryEvent: (event: TelemetryEvent) => void;
  finalizarExamen: () => Promise<void>;
}

const ExamContext = createContext<ExamContextValue | null>(null);

export function useExamContext() {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExamContext must be used within ExamProvider");
  return ctx;
}

function ExamProvider({
  children,
  evaluacionId,
  evaluacion,
  preguntas,
  initialIntento,
  initialTiempoRestante,
}: {
  children: ReactNode;
  evaluacionId: string;
  evaluacion: IniciarResponse["evaluacion"];
  preguntas: Pregunta[];
  initialIntento: Intento;
  initialTiempoRestante: number;
}) {
  const [intento, setIntento] = useState<Intento>(initialIntento);
  const [tiempoRestante, setTiempoRestante] = useState(initialTiempoRestante);
  const [currentIndex, setCurrentIndex] = useState(initialIntento.pregunta_actual_idx);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const router = useRouter();

  const addTelemetryEvent = useCallback((event: TelemetryEvent) => {
    // This will be connected via TelemetryProvider
  }, []);

  const handleAutoSave = useAutoSave({
    evaluacionId,
    preguntaId: preguntas[currentIndex]?.id,
    getRespuesta: () => intento.respuestas[preguntas[currentIndex]?.id || ""]?.respuesta || "",
    getTiempoSegundos: () => intento.respuestas[preguntas[currentIndex]?.id || ""]?.tiempo_segundos || 0,
    getEventos: () => intento.respuestas[preguntas[currentIndex]?.id || ""]?.eventos || [],
    onSave: (respuesta, tiempo_segundos, eventos) => {
      setIntento((prev: Intento) => ({
        ...prev,
        respuestas: {
          ...prev.respuestas,
          [preguntas[currentIndex].id]: {
            respuesta,
            tiempo_segundos,
            eventos,
            respondida_en: new Date().toISOString(),
          },
        },
        pregunta_actual_idx: currentIndex,
      }));
    },
  });

  const finalizarExamen = useCallback(async () => {
    if (isFinalizing) return;
    setIsFinalizing(true);

    try {
      const respuestasFinales: Record<string, { respuesta: string; tiempo_segundos: number; eventos: TelemetryEvent[] }> = {};
      for (const [pid, r] of Object.entries(intento.respuestas)) {
        if (r && typeof r === "object" && "respuesta" in r) {
          respuestasFinales[pid] = {
            respuesta: r.respuesta,
            tiempo_segundos: r.tiempo_segundos,
            eventos: r.eventos,
          };
        }
      }

      const res = await fetch(`/api/alumno/examenes/${evaluacionId}/finalizar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respuestas_finales: respuestasFinales }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al finalizar");
      }

      router.push("/alumno/evaluaciones");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      alert(message);
      setIsFinalizing(false);
    }
  }, [evaluacionId, intento.respuestas, router, isFinalizing]);

  const value: ExamContextValue = {
    evaluacionId,
    evaluacion,
    preguntas,
    intento,
    setIntento,
    tiempoRestante,
    setTiempoRestante,
    currentIndex,
    setCurrentIndex,
    isFinalizing,
    addTelemetryEvent,
    finalizarExamen,
  };

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export function ExamRendirClient({ initialData, error, evaluacionId }: ExamRendirClientProps) {
  const router = useRouter();

  useExamTimer({
    tiempoRestante: initialData?.tiempo_restante_segundos || 0,
    onTick: () => {},
    onTimeUp: () => {},
    enabled: !!initialData,
  });

  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = "";
    if (initialData) {
      navigator.sendBeacon(
        `/api/alumno/examenes/${evaluacionId}/telemetria`,
        JSON.stringify({
          eventos: [{
            type: "connection_lost",
            timestamp: new Date().toISOString(),
            pregunta_id: initialData.preguntas[initialData.intento.pregunta_actual_idx]?.id || "",
          }],
        })
      );
    }
  }, [evaluacionId, initialData]);

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [handleBeforeUnload]);

  const handleExit = () => {
    router.push("/alumno/evaluaciones");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col font-sans">
        <BaseHeader
          user={null}
          role="ALUMNO"
          navigationLinks={[
            { href: "/alumno/inicio", label: "Inicio" },
            { href: "/alumno/evaluaciones", label: "Evaluaciones", active: true },
          ]}
          onProfile={() => {}}
          onChangePassword={() => {}}
          onLogout={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); }}
          brandColor="purple"
          isLoading={false}
        />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 flex items-center justify-center">
          <div className="text-center text-[var(--color-danger)]">
            <p className="font-medium text-lg mb-4">Error al cargar la evaluación</p>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">{error}</p>
            <button
              onClick={handleExit}
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
            >
              Volver a Evaluaciones
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col font-sans">
        <BaseHeader
          user={null}
          role="ALUMNO"
          navigationLinks={[
            { href: "/alumno/inicio", label: "Inicio" },
            { href: "/alumno/evaluaciones", label: "Evaluaciones", active: true },
          ]}
          onProfile={() => {}}
          onChangePassword={() => {}}
          onLogout={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); }}
          brandColor="purple"
          isLoading={true}
        />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full max-w-3xl">
            <div className="h-8 bg-[var(--color-border)] rounded w-3/4" />
            <div className="h-4 bg-[var(--color-border)] rounded w-1/2" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <ExamProvider
      evaluacionId={evaluacionId}
      evaluacion={initialData.evaluacion}
      preguntas={initialData.preguntas}
      initialIntento={initialData.intento}
      initialTiempoRestante={initialData.tiempo_restante_segundos}
    >
      <TelemetryProvider evaluacionId={evaluacionId}>
        <div className="min-h-screen bg-[var(--color-background)] flex flex-col font-sans">
          <BaseHeader
            user={null}
            role="ALUMNO"
            navigationLinks={[
              { href: "/alumno/inicio", label: "Inicio" },
              { href: "/alumno/evaluaciones", label: "Evaluaciones", active: true },
            ]}
            onProfile={() => {}}
            onChangePassword={() => {}}
            onLogout={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); }}
            brandColor="purple"
            isLoading={false}
          />

          <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
            <ExamHeader />
            <QuestionView />
            <NavigationBar />
          </main>
        </div>
      </TelemetryProvider>
    </ExamProvider>
  );
}