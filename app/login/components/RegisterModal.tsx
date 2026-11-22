"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { type Role } from "./RoleSelector";

type RegisterModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Institucion = {
  id: string;
  nombre: string;
  dominio: string;
};

export default function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>("alumno");
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    institucion_id: "",
    password: "",
    confirmPassword: "",
    matricula: "",
    numero_empleado: "",
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInstituciones, setIsLoadingInstituciones] = useState(true);
  const router = useRouter();

  const cargarInstituciones = useCallback(async () => {
    setIsLoadingInstituciones(true);
    try {
      const res = await fetch("/api/instituciones");
      if (res.ok) {
        const data = await res.json();
        setInstituciones(data);
      }
    } catch {
      console.error("Error cargando instituciones");
    } finally {
      setIsLoadingInstituciones(false);
    }
  }, []);

  // Cargar instituciones al abrir el modal
  useEffect(() => {
    if (isOpen) {
      // La petición es asíncrona; el estado solo refleja el inicio de la carga.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      cargarInstituciones();
    }
  }, [isOpen, cargarInstituciones]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Nombre completo es requerido";
    if (!formData.email.trim()) newErrors.email = "Correo institucional es requerido";
    else if (!formData.email.includes("@")) {
      newErrors.email = "Ingresa un correo válido";
    }
    if (!formData.institucion_id) newErrors.institucion_id = "Selecciona una institución";
    if (!formData.password) newErrors.password = "Contraseña es requerida";
    else if (formData.password.length < 8) newErrors.password = "Mínimo 8 caracteres";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    // Matrícula requerida para alumnos
    if (role === "alumno" && (!formData.matricula || !formData.matricula.trim())) {
      newErrors.matricula = "La matrícula es obligatoria para alumnos";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          institucion_id: formData.institucion_id,
          password: formData.password,
          role,
          matricula: role === "alumno" ? formData.matricula : undefined,
          numero_empleado: role === "docente" ? formData.numero_empleado : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.message || "Error al registrar usuario");
        return;
      }

      // Guardar token y usuario
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onClose();
      // Redirigir según el rol
      const redirectPath = role === "docente" ? "/docente" : "/alumno";
      router.push(redirectPath);
      router.refresh();
    } catch {
      setApiError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (apiError) setApiError("");
  };

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    // Limpiar campos específicos del rol anterior
    setFormData((prev) => ({
      ...prev,
      matricula: newRole === "alumno" ? prev.matricula : "",
      numero_empleado: newRole === "docente" ? prev.numero_empleado : "",
    }));
    // Limpiar errores
    setErrors((prev) => {
      const next = { ...prev };
      delete next.matricula;
      delete next.numero_empleado;
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 transition disabled:opacity-50"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5 cursor-pointer" />
        </button>

        <h2 className="text-3xl font-bold text-center text-zinc-900 mt-5">CREAR CUENTA</h2>
        <p className="mt-2 text-center text-zinc-500">
          Completa tus datos para registrarte
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Role Selector */}
          <div className="space-y-2">
            <div className="flex gap-2">
              {(["alumno", "docente"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleChange(r)}
                  disabled={isLoading}
                  className={`flex-1 h-10 rounded-lg border text-sm font-medium transition ${role === r
                      ? "bg-[#6543AB] border-[#6543AB] text-white"
                      : "border-zinc-200 text-zinc-700 hover:border-zinc-400"
                    } disabled:opacity-50`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {apiError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center" role="alert">
              {apiError}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-zinc-700"
            >
              Nombre completo
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Juan Pérez García"
              value={formData.fullName}
              onChange={handleChange}
              disabled={isLoading}
              className={`h-11 w-full rounded-lg border bg-white px-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 ${errors.fullName
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                : "border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                } disabled:bg-zinc-50`}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-700"
            >
              Correo institucional
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="juan.perez@institucion.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className={`h-11 w-full rounded-lg border bg-white px-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 ${errors.email
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                : "border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                } disabled:bg-zinc-50`}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          {/* Institution Selector */}
          <div className="space-y-2">
            <label
              htmlFor="institucion_id"
              className="block text-sm font-medium text-zinc-700"
            >
              Institución
            </label>
            {isLoadingInstituciones ? (
              <div className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 flex items-center text-zinc-400">
                Cargando instituciones...
              </div>
            ) : (
              <select
                id="institucion_id"
                name="institucion_id"
                value={formData.institucion_id}
                onChange={handleChange}
                disabled={isLoading}
                className={`h-11 w-full rounded-lg border bg-white px-4 text-base text-zinc-900 outline-none transition ${errors.institucion_id
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                  : "border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                  } disabled:bg-zinc-50`}
              >
                <option value="">Selecciona tu institución</option>
                {instituciones.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.nombre}
                  </option>
                ))}
              </select>
            )}
            {errors.institucion_id && (
              <p className="text-sm text-red-500">{errors.institucion_id}</p>
            )}
          </div>

          {/* Role-specific fields */}
          {role === "alumno" && (
            <div className="space-y-2">
              <label
                htmlFor="matricula"
                className="block text-sm font-medium text-zinc-700"
              >
                Matrícula <span className="text-red-500">*</span>
              </label>
              <input
                id="matricula"
                name="matricula"
                type="text"
                placeholder="A123456"
                value={formData.matricula}
                onChange={handleChange}
                disabled={isLoading}
                required
                className={`h-11 w-full rounded-lg border bg-white px-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 ${errors.matricula
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                  : "border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                  } disabled:bg-zinc-50`}
              />
              {errors.matricula && <p className="text-sm text-red-500">{errors.matricula}</p>}
              <p className="text-xs text-zinc-400">Obligatorio para alumnos</p>
            </div>
          )}

          {role === "docente" && (
            <div className="space-y-2">
              <label
                htmlFor="numero_empleado"
                className="block text-sm font-medium text-zinc-700"
              >
                Número de empleado (opcional)
              </label>
              <input
                id="numero_empleado"
                name="numero_empleado"
                type="text"
                placeholder="EMP-001"
                value={formData.numero_empleado}
                onChange={handleChange}
                disabled={isLoading}
                className="h-11 w-full rounded-lg border bg-white px-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 disabled:bg-zinc-50"
              />
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className={`h-11 w-full rounded-lg border bg-white pl-4 pr-12 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 ${errors.password
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                  : "border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                  } disabled:bg-zinc-50`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-500 hover:text-zinc-700 transition cursor-pointer disabled:opacity-50"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-zinc-700"
            >
              Repetir contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              className={`h-11 w-full rounded-lg border bg-white px-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 ${errors.confirmPassword
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                : "border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                } disabled:bg-zinc-50`}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-11 w-full items-center justify-center rounded-lg bg-[#6543AB] text-base font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          ¿Ya tienes cuenta?{" "}
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="font-medium text-zinc-900 hover:underline cursor-pointer disabled:opacity-50"
          >
            Iniciar sesión
          </button>
        </p>
      </div>
    </div>
  );
}
