"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback, useRef } from "react";
import { useExamContext } from "./ExamRendirClient";
import { useTelemetryContext } from "./TelemetryProvider";
import type { Pregunta } from "./types";

const Editor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.Editor),
  { ssr: false, loading: () => <div className="h-[300px] bg-[var(--color-background)] rounded-lg animate-pulse" /> }
);

interface MonacoEditorQuestionProps {
  pregunta: Pregunta;
  respuestaActual: string;
}

export function MonacoEditorQuestion({ pregunta, respuestaActual }: MonacoEditorQuestionProps) {
  const { setIntento, intento } = useExamContext();
  const { monacoHandlers, addEvent } = useTelemetryContext();
  const [code, setCode] = useState(respuestaActual);
  const [tiempoSegundos, setTiempoSegundos] = useState(0);
  const [language, setLanguage] = useState("plaintext");
  const editorRef = useRef<any>(null);
  const lastContentRef = useRef(respuestaActual);

  useEffect(() => {
    const ext = pregunta.enunciado.match(/\.(py|js|ts|java|cpp|c|cs|go|rs|rb|php|sql|html|css|json|xml|yaml|yml|sh|bash|ps1|bat|md|txt)$/i);
    if (ext) {
      const langMap: Record<string, string> = {
        py: "python",
        js: "javascript",
        ts: "typescript",
        java: "java",
        cpp: "cpp",
        c: "c",
        cs: "csharp",
        go: "go",
        rs: "rust",
        rb: "ruby",
        php: "php",
        sql: "sql",
        html: "html",
        css: "css",
        json: "json",
        xml: "xml",
        yaml: "yaml",
        yml: "yaml",
        sh: "shell",
        bash: "shell",
        ps1: "powershell",
        bat: "bat",
        md: "markdown",
        txt: "plaintext",
      };
      setLanguage(langMap[ext[1].toLowerCase()] || "plaintext");
    }
  }, [pregunta.enunciado]);

  useEffect(() => {
    setCode(respuestaActual);
    lastContentRef.current = respuestaActual;
  }, [respuestaActual]);

  useEffect(() => {
    const interval = setInterval(() => setTiempoSegundos((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEditorMount = useCallback((editor: any) => {
    editorRef.current = editor;

    editor.onDidChangeModelContent((e: any) => {
      const model = editor.getModel();
      const newContent = model.getValue();
      const changes = e.changes;

      for (const change of changes) {
        if (change.text && change.text.length > 1 && change.text.includes("\n")) {
          monacoHandlers.onPaste?.(change.text.join("\n"));
        }
      }

      if (newContent.length > lastContentRef.current.length + 50) {
        monacoHandlers.onPaste?.(newContent.slice(lastContentRef.current.length));
      }

      lastContentRef.current = newContent;
      monacoHandlers.onDidChangeModelContent?.();
    });

    editor.onKeyDown((e: any) => {
      if ((e.ctrlKey || e.metaKey) && e.keyCode === 67) {
        addEvent({
          type: "copy_attempt",
          timestamp: new Date().toISOString(),
          pregunta_id: pregunta.id,
        });
      }
    });
  }, [pregunta.id, monacoHandlers]);

  const handleChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  }, []);

  const handleBlur = useCallback(() => {
    const newRespuestas = { ...intento.respuestas };
    newRespuestas[pregunta.id] = {
      respuesta: code,
      tiempo_segundos: tiempoSegundos,
      eventos: [],
      respondida_en: new Date().toISOString(),
    };
    setIntento((prev) => ({ ...prev, respuestas: newRespuestas }));
  }, [pregunta.id, code, tiempoSegundos, setIntento, intento]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-[var(--color-background)] border border-[var(--color-border)] rounded">
            {language}
          </span>
        </div>
        <p className="font-normal text-xs text-[var(--color-text-muted)]">
          Tiempo: {Math.floor(tiempoSegundos / 60)}:{String(tiempoSegundos % 60).padStart(2, "0")}
        </p>
      </div>
      <Editor
        height="350px"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={handleChange}
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: "on",
          contextmenu: false,
          readOnly: false,
        }}
      />
    </div>
  );
}