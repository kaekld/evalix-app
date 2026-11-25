"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Modal, Input, Textarea, Button, Select } from "@/components/ui";
import { Trash2, Plus, Code } from "lucide-react";
import { Pregunta, Opcion, OpcionInput, PreguntaInput } from "./types";

interface PreguntaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pregunta: PreguntaInput) => void;
  initialData?: Pregunta | null;
  isLoading?: boolean;
}

function getInitialOpciones(initialData?: Pregunta | null): Omit<OpcionInput, "id" | "pregunta_id">[] {
  if (initialData?.opciones) {
    return initialData.opciones.map((o) => ({ texto: o.texto, es_correcta: o.esCorrecta }));
  }
  return [
    { texto: "", es_correcta: false },
    { texto: "", es_correcta: false },
    { texto: "", es_correcta: false },
    { texto: "", es_correcta: false },
  ];
}

export default function PreguntaForm({
  isOpen,
  onClose,
  onSave,
  initialData,
  isLoading = false,
}: PreguntaFormProps) {
  const [tipo, setTipo] = useState<"cerrada" | "abierta">("cerrada");
  const [enunciado, setEnunciado] = useState("");
  const [tiempoSegundos, setTiempoSegundos] = useState(60);
  const [imagenUrl, setImagenUrl] = useState("");
  const [codigoInicial, setCodigoInicial] = useState("");
  const [conEditor, setConEditor] = useState(false);
  const [opciones, setOpciones] = useState<Omit<OpcionInput, "id" | "pregunta_id">[]>(() => getInitialOpciones(initialData));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");

  // Use ref to store initialData for handleSubmit without adding to dependency array
  const initialDataRef = useRef(initialData);
  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  // Reset form when opening/closing
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setTipo(initialData.tipo || "cerrada");
      setEnunciado(initialData.enunciado);
      setTiempoSegundos(initialData.tiempoSegundos);
      setImagenUrl(initialData.imagenUrl || "");
      setCodigoInicial(initialData.codigoInicial || "");
      setConEditor(!!initialData.codigoInicial);
      setOpciones(getInitialOpciones(initialData));
    } else {
      setTipo("cerrada");
      setEnunciado("");
      setTiempoSegundos(60);
      setImagenUrl("");
      setCodigoInicial("");
      setConEditor(false);
      setOpciones(getInitialOpciones(null));
    }
    setErrors({});
    setApiError("");
  }, [isOpen, initialData]);
  /* eslint-enable react-hooks/set-state-in-effect */

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

  const handleOpcionChange = useCallback(
    (index: number, field: "texto" | "es_correcta", value: string | boolean) => {
      setOpciones((prev) =>
        prev.map((o, i) => (i === index ? { ...o, [field]: value } : o))
      );
      clearError(`opcion-${index}`);
    },
    [clearError]
  );

  const addOpcion = useCallback(() => {
    if (opciones.length < 6) {
      setOpciones((prev) => [...prev, { texto: "", es_correcta: false }]);
    }
  }, [opciones.length]);

  const removeOpcion = useCallback((index: number) => {
    if (opciones.length > 2) {
      setOpciones((prev) => prev.filter((_, i) => i !== index));
    }
  }, [opciones.length]);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!enunciado.trim()) newErrors.enunciado = "El enunciado es requerido";
    if (tiempoSegundos < 10) newErrors.tiempo = "Mínimo 10 segundos";

    if (tipo === "cerrada") {
      let correctCount = 0;
      opciones.forEach((o, i) => {
        if (!o.texto.trim()) newErrors[`opcion-${i}`] = "Texto requerido";
        if (o.es_correcta) correctCount++;
      });
      if (correctCount === 0) newErrors.correcta = "Debe haber al menos una respuesta correcta";
      if (correctCount > 1) newErrors.correcta = "Solo una respuesta correcta permitida";
    }

    if (tipo === "abierta" && conEditor && codigoInicial.length > 50000) {
      newErrors.codigoInicial = "El código inicial no puede exceder 50,000 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [enunciado, tiempoSegundos, opciones, tipo, conEditor, codigoInicial]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      const currentInitialData = initialDataRef.current;
      setApiError("");
      try {
        await onSave({
          tipo,
          enunciado: enunciado.trim(),
          imagen_url: imagenUrl.trim() || undefined,
          tiempo_segundos: tiempoSegundos,
          orden: currentInitialData?.orden || 0,
          opciones: tipo === "cerrada"
            ? opciones.map((o, i) => ({
                id: currentInitialData?.opciones?.[i]?.id || `opt-${Date.now()}-${i}`,
                pregunta_id: currentInitialData?.id || "",
                texto: o.texto.trim(),
                es_correcta: o.es_correcta,
              }))
            : [],
          codigo_inicial: tipo === "abierta" && conEditor ? codigoInicial.trim() : undefined,
        });
      } catch {
        setApiError("Error al guardar la pregunta. Intenta de nuevo.");
      }
    },
    [enunciado, tiempoSegundos, imagenUrl, opciones, tipo, conEditor, codigoInicial, onSave, validate]
  );

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={initialData ? "EDITAR PREGUNTA" : "NUEVA PREGUNTA CERRADA"}
      description="Configura la pregunta y sus opciones"
      size="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" form="pregunta-form" loading={isLoading} disabled={isLoading}>
            {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Crear pregunta"}
          </Button>
        </>
      }
    >
      <form id="pregunta-form" onSubmit={handleSubmit} className="space-y-4">
        {apiError && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center" role="alert">
            {apiError}
          </div>
        )}

        <Textarea
          label="Enunciado"
          id="enunciado"
          rows={3}
          placeholder="Escribe el enunciado de la pregunta..."
          value={enunciado}
          onChange={(e) => {
            setEnunciado(e.target.value);
            clearError("enunciado");
          }}
          disabled={isLoading}
          error={errors.enunciado}
        />

        <Input
          label="URL de imagen de referencia (opcional)"
          id="imagenUrl"
          type="url"
          placeholder="https://ejemplo.com/imagen.png"
          value={imagenUrl}
          onChange={(e) => setImagenUrl(e.target.value)}
          disabled={isLoading}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Tipo de pregunta"
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "cerrada" | "abierta")}
            disabled={isLoading}
            options={[
              { value: "cerrada", label: "Opción única (calificación automática)" },
              { value: "abierta", label: "Respuesta abierta (revisión manual)" },
            ]}
          />
        </div>

        {tipo === "abierta" && (
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={conEditor}
                onChange={(e) => setConEditor(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 rounded border-[#dedee8] text-[#6543ab] focus:ring-[#6543ab]"
              />
              <span className="text-sm font-medium text-[#232334]">Incluir editor de código</span>
              <Code className="h-4 w-4 text-[#747487]" />
            </label>
            <p className="text-xs text-[#747487] ml-6">
              El alumno podrá editar el código durante la pregunta. Telemetría: paste, typing, copy.
            </p>

            {conEditor && (
              <Textarea
                label="Código inicial (opcional)"
                id="codigoInicial"
                rows={12}
                placeholder="// Escribe aquí el código inicial que verá el alumno\n// Ejemplo:\nfunction suma(a, b) {\n  // TODO: implementar\n  return a + b;\n}"
                value={codigoInicial}
                onChange={(e) => {
                  setCodigoInicial(e.target.value);
                  clearError("codigoInicial");
                }}
                disabled={isLoading}
                error={errors.codigoInicial}
                className="font-mono text-sm"
              />
            )}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Tiempo por pregunta (segundos)"
            id="tiempoSegundos"
            type="number"
            min="10"
            max="3600"
            value={tiempoSegundos}
            onChange={(e) => {
              setTiempoSegundos(Number(e.target.value) || 0);
              clearError("tiempo");
            }}
            disabled={isLoading}
            error={errors.tiempo}
          />
        </div>

        {tipo === "cerrada" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-[#232334]">Opciones de respuesta</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addOpcion}
                disabled={isLoading || opciones.length >= 6}
              >
                <Plus className="h-4 w-4 mr-1" />
                Añadir opción
              </Button>
            </div>

            {opciones.map((opcion, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correcta"
                  checked={opcion.es_correcta}
                  onChange={() => handleOpcionChange(index, "es_correcta", true)}
                  className="h-4 w-4 text-[#6543ab] focus:ring-[#6543ab] cursor-pointer"
                  disabled={isLoading}
                />
                <Input
                  label=""
                  id={`opcion-${index}`}
                  type="text"
                  placeholder={`Opción ${index + 1}`}
                  value={opcion.texto}
                  onChange={(e) => handleOpcionChange(index, "texto", e.target.value)}
                  disabled={isLoading}
                  error={errors[`opcion-${index}`]}
                  className="flex-1"
                />
                {opciones.length > 2 && (
                  <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOpcion(index)}
                  disabled={isLoading}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {errors.correcta && (
            <p className="text-sm text-red-600 ml-6">{errors.correcta}</p>
          )}
          </div>
        )}
      </form>
    </Modal>
  );
}