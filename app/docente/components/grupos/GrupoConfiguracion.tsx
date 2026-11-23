"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface Grupo {
  id: string;
  nombre: string;
  codigo: string;
  categoria: string;
  descripcion: string | null;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
  institucion_id: string;
}

interface Configuracion {
  id: string;
  grupo_id: string;
  permitir_revision: boolean;
  mostrar_resultados_auto: boolean;
  tiempo_limite_pregunta: number | null;
  orden_aleatorio: boolean;
  creado_en: string;
  actualizado_en: string;
}

interface GrupoConfiguracionProps {
  grupo: Grupo;
  configuracion: Configuracion | null;
}

const defaultConfig: Configuracion = {
  id: "",
  grupo_id: "",
  permitir_revision: true,
  mostrar_resultados_auto: false,
  tiempo_limite_pregunta: 60,
  orden_aleatorio: false,
  creado_en: "",
  actualizado_en: "",
};

export default function GrupoConfiguracion({ grupo, configuracion: serverConfig }: GrupoConfiguracionProps) {
  const router = useRouter();
  const config = serverConfig || { ...defaultConfig, grupo_id: grupo.id };
  const [formData, setFormData] = useState({
    permitir_revision: config.permitir_revision,
    mostrar_resultados_auto: config.mostrar_resultados_auto,
    tiempo_limite_pregunta: config.tiempo_limite_pregunta?.toString() || "60",
    orden_aleatorio: config.orden_aleatorio,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === "tiempo_limite_pregunta") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        permitir_revision: formData.permitir_revision,
        mostrar_resultados_auto: formData.mostrar_resultados_auto,
        tiempo_limite_pregunta: parseInt(formData.tiempo_limite_pregunta) || 60,
        orden_aleatorio: formData.orden_aleatorio,
      };

      const res = await fetch(`/api/docente/grupos/${grupo.id}/configuracion`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al guardar configuración");
      }

      setMessage({ type: "success", text: "Configuración guardada correctamente" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Error al guardar configuración" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-700 hover:bg-white transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm text-zinc-500">Grupo / {grupo.nombre}</p>
          <h1 className="font-semibold text-2xl leading-relaxed text-[#232334] tracking-tight">
            Configuración
          </h1>
        </div>
      </div>

      {/* Config form */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#dedee8] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#dedee8] bg-[#f6f6fa]">
          <h2 className="font-semibold text-zinc-900">Opciones de evaluación</h2>
        </div>
        <div className="p-4 space-y-6">
          {message && (
            <div className={`flex items-center gap-3 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}>
              {message.type === "success" ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <p>{message.text}</p>
            </div>
          )}

          {/* Permitir revisión */}
          <div className="flex items-center justify-between py-3 border-b border-[#dedee8]">
            <div>
              <p className="font-medium text-zinc-900">Permitir solicitud de revisión</p>
              <p className="text-sm text-zinc-500">
                Los estudiantes pueden solicitar revisión de sus respuestas abiertas después de la calificación
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="permitir_revision"
                checked={formData.permitir_revision}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#6543ab]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6543ab]"></div>
            </label>
          </div>

          {/* Mostrar resultados automáticos */}
          <div className="flex items-center justify-between py-3 border-b border-[#dedee8]">
            <div>
              <p className="font-medium text-zinc-900">Mostrar resultados automáticos</p>
              <p className="text-sm text-zinc-500">
                Los estudiantes ven su calificación inmediata en preguntas cerradas al terminar el examen
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="mostrar_resultados_auto"
                checked={formData.mostrar_resultados_auto}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#6543ab]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6543ab]"></div>
            </label>
          </div>

          {/* Orden aleatorio */}
          <div className="flex items-center justify-between py-3 border-b border-[#dedee8]">
            <div>
              <p className="font-medium text-zinc-900">Orden aleatorio de preguntas</p>
              <p className="text-sm text-zinc-500">
                Las preguntas se muestran en orden aleatorio para cada estudiante
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="orden_aleatorio"
                checked={formData.orden_aleatorio}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#6543ab]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6543ab]"></div>
            </label>
          </div>

          {/* Tiempo límite por pregunta */}
          <div className="py-3">
            <label htmlFor="tiempo_limite_pregunta" className="block">
              <p className="font-medium text-zinc-900">Tiempo límite por pregunta (segundos)</p>
              <p className="text-sm text-zinc-500">
                Tiempo máximo para responder cada pregunta. Dejar en 60 para el valor por defecto.
              </p>
            </label>
            <div className="mt-2">
              <input
                type="number"
                id="tiempo_limite_pregunta"
                name="tiempo_limite_pregunta"
                value={formData.tiempo_limite_pregunta}
                onChange={handleChange}
                min="10"
                max="3600"
                className="w-full max-w-xs px-3 py-2 rounded-lg border border-[#dedee8] focus:outline-none focus:ring-2 focus:ring-[#6543ab]/20 focus:border-[#6543ab] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#dedee8] bg-[#f6f6fa] flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="h-11 px-6 rounded-lg border border-[#dedee8] font-semibold text-sm text-zinc-700 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-11 px-6 rounded-lg bg-[#6543AB] font-semibold text-sm text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar cambios
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info card */}
      <div className="bg-white border border-[#dedee8] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#dedee8] bg-[#f6f6fa]">
          <h2 className="font-semibold text-zinc-900">Información del grupo</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Código</p>
              <p className="font-mono text-base text-zinc-900 mt-1">{grupo.codigo}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Categoría</p>
              <p className="text-base text-zinc-900 mt-1">{grupo.categoria}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Estado</p>
              <p className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  grupo.activo
                    ? "bg-[#e5f2e8] text-[#336647]"
                    : "bg-[#fef2f2] text-[#ad3040]"
                }`}>
                  {grupo.activo ? "Activo" : "Inactivo"}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Creado</p>
              <p className="text-base text-zinc-900 mt-1">
                {new Date(grupo.creado_en).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {grupo.descripcion && (
            <div className="pt-4 border-t border-[#dedee8]">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Descripción</p>
              <p className="text-base text-zinc-700 mt-1 whitespace-pre-wrap">{grupo.descripcion}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}