"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Modal, Input, Textarea, Button } from "@/components/ui";
import { Trash2, Plus } from "lucide-react";
import { Pregunta, Opcion } from "./types";

type OpcionInput = Omit<Opcion, "id" | "preguntaId">;

interface PreguntaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pregunta: Omit<Pregunta, "id" | "evaluacionId"> & { opciones: OpcionInput[] }) => void;
  initialData?: Pregunta | null;
  isLoading?: boolean;
}

function getInitialOpciones(initialData?: Pregunta | null): Omit<Opcion, "id" | "preguntaId">[] {
  if (initialData?.opciones) {
    return initialData.opciones.map((o) => ({ texto: o.texto, esCorrecta: o.esCorrecta }));
  }
  return [
    { texto: "", esCorrecta: false },
    { texto: "", esCorrecta: false },
    { texto: "", esCorrecta: false },
    { texto: "", esCorrecta: false },
  ];
}

export default function PreguntaForm({
  isOpen,
  onClose,
  onSave,
  initialData,
  isLoading = false,
}: PreguntaFormProps) {
  const [enunciado, setEnunciado] = useState("");
  const [tiempoSegundos, setTiempoSegundos] = useState(60);
  const [imagenUrl, setImagenUrl] = useState("");
  const [opciones, setOpciones] = useState<Omit<Opcion, "id" | "preguntaId">[]>(() => getInitialOpciones(initialData));
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
      setEnunciado(initialData.enunciado);
      setTiempoSegundos(initialData.tiempoSegundos);
      setImagenUrl(initialData.imagenUrl || "");
      setOpciones(getInitialOpciones(initialData));
    } else {
      setEnunciado("");
      setTiempoSegundos(60);
      setImagenUrl("");
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
    (index: number, field: "texto" | "esCorrecta", value: string | boolean) => {
      setOpciones((prev) =>
        prev.map((o, i) => (i === index ? { ...o, [field]: value } : o))
      );
      clearError(`opcion-${index}`);
    },
    [clearError]
  );

  const addOpcion = useCallback(() => {
    if (opciones.length < 6) {
      setOpciones((prev) => [...prev, { texto: "", esCorrecta: false }]);
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

    let correctCount = 0;
    opciones.forEach((o, i) => {
      if (!o.texto.trim()) newErrors[`opcion-${i}`] = "Texto requerido";
      if (o.esCorrecta) correctCount++;
    });
    if (correctCount === 0) newErrors.correcta = "Debe haber al menos una respuesta correcta";
    if (correctCount > 1) newErrors.correcta = "Solo una respuesta correcta permitida";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [enunciado, tiempoSegundos, opciones]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      const currentInitialData = initialDataRef.current;
      setApiError("");
      try {
        await onSave({
          tipo: "cerrada",
          enunciado: enunciado.trim(),
          imagenUrl: imagenUrl.trim() || undefined,
          tiempoSegundos,
          orden: currentInitialData?.orden || 0,
          opciones: opciones.map((o, i) => ({
            id: currentInitialData?.opciones?.[i]?.id || `opt-${Date.now()}-${i}`,
            preguntaId: currentInitialData?.id || "",
            texto: o.texto.trim(),
            esCorrecta: o.esCorrecta,
          })),
        });
      } catch {
        setApiError("Error al guardar la pregunta. Intenta de nuevo.");
      }
    },
    [enunciado, tiempoSegundos, imagenUrl, opciones, onSave, validate]
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
                checked={opcion.esCorrecta}
                onChange={() => handleOpcionChange(index, "esCorrecta", true)}
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
      </form>
    </Modal>
  );
}