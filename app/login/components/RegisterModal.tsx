"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Modal, Input, Select, Button } from "@/components/ui";
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

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => {
        if (prev[name as keyof typeof prev]) {
          const next = { ...prev };
          delete next[name as keyof typeof next];
          return next;
        }
        return prev;
      });
      setApiError((prev) => (prev ? "" : prev));
    },
    []
  );

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

  const institucionOptions = instituciones.map((inst) => ({ value: inst.id, label: inst.nombre }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CREAR CUENTA"
      description="Completa tus datos para registrarte"
      size="md"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" form="register-form" loading={isLoading} disabled={isLoading}>
            {isLoading ? "Registrando..." : "Registrarse"}
          </Button>
        </>
      }
    >
      <form id="register-form" onSubmit={handleSubmit} className="space-y-4">
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
                    ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-text-secondary)]"
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

        <Input
          label="Nombre completo"
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="Juan Pérez García"
          value={formData.fullName}
          onChange={handleChange}
          disabled={isLoading}
          error={errors.fullName}
        />

        <Input
          label="Correo institucional"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="juan.perez@institucion.com"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          error={errors.email}
        />

        {/* Institution Selector */}
        <div className="space-y-2">
          <label htmlFor="institucion_id" className="block text-sm font-medium text-[var(--color-text-primary)]">
            Institución
          </label>
          {isLoadingInstituciones ? (
            <div className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-skeleton)] px-4 flex items-center text-[var(--color-text-muted)]">
              Cargando instituciones...
            </div>
          ) : (
            <Select
              id="institucion_id"
              name="institucion_id"
              value={formData.institucion_id}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Selecciona tu institución"
              options={institucionOptions}
              error={errors.institucion_id}
            />
          )}
        </div>

        {/* Role-specific fields */}
        {role === "alumno" && (
          <Input
            label="Matrícula *"
            id="matricula"
            name="matricula"
            type="text"
            placeholder="A123456"
            value={formData.matricula}
            onChange={handleChange}
            disabled={isLoading}
            required
            error={errors.matricula}
          />
        )}

        {role === "docente" && (
          <Input
            label="Número de empleado (opcional)"
            id="numero_empleado"
            name="numero_empleado"
            type="text"
            placeholder="EMP-001"
            value={formData.numero_empleado}
            onChange={handleChange}
            disabled={isLoading}
          />
        )}

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-primary)]">
            Contraseña
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className="pr-12"
              error={errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition cursor-pointer disabled:opacity-50"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>

        <Input
          label="Repetir contraseña"
          id="confirmPassword"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={isLoading}
          error={errors.confirmPassword}
        />
      </form>
    </Modal>
  );
}