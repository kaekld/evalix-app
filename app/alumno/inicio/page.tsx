"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface Exam {
  id: number;
  unit: string;
  date: string;
  time?: string;
  status: "upcoming" | "completed";
}

interface Group {
  id: number;
  name: string;
  code: string;
  students: string;
  exams: Exam[];
  expanded: boolean;
}

interface User {
  id: string;
  nombre_completo: string;
  correo: string;
  institucion: string | null;
  institucion_id: string | null;
  rol: string;
}

const groupsData: Group[] = [
  {
    id: 1,
    name: "Programación Orientada a Objetos",
    code: "Grupo A · 24 estudiantes",
    students: "24 estudiantes",
    exams: [
      { id: 1, unit: "Unidad 1", date: "12 NOV 2026", status: "completed" },
    ],
    expanded: false,
  },
  {
    id: 2,
    name: "Sistemas Programables",
    code: "Grupo B · 18 estudiantes",
    students: "18 estudiantes",
    exams: [
      { id: 2, unit: "Unidad 2", date: "20 NOV · 11:00 h", status: "upcoming" },
      { id: 3, unit: "Unidad 1", date: "15 NOV 2026", status: "completed" },
    ],
    expanded: false,
  },
];

// Modal Mi Perfil
function PerfilModal({ isOpen, onClose, user }: { isOpen: boolean; onClose: () => void; user: User | null }) {
  const [formData, setFormData] = useState({
    nombre_completo: user?.nombre_completo || "",
    correo: user?.correo || "",
    institucion: user?.institucion || "",
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        nombre_completo: user.nombre_completo || "",
        correo: user.correo || "",
        institucion: user.institucion || "",
      });
      setErrors({});
      setApiError("");
      setApiSuccess("");
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.nombre_completo.trim()) newErrors.nombre_completo = "Nombre completo es requerido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setApiSuccess("");
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("/api/auth/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre_completo: formData.nombre_completo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.message || "Error al actualizar perfil");
        return;
      }

      // Actualizar localStorage
      const updatedUser = { ...user!, ...data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setApiSuccess("Perfil actualizado correctamente");
      
      // Refrescar datos del usuario en el padre
      window.dispatchEvent(new CustomEvent("user-updated", { detail: updatedUser }));
    } catch {
      setApiError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (apiError) setApiError("");
    if (apiSuccess) setApiSuccess("");
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

        <h2 className="text-3xl font-bold text-center text-zinc-900 mt-5">MI PERFIL</h2>
        <p className="mt-2 text-center text-zinc-500">
          Gestiona tu información personal
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {apiError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center" role="alert">
              {apiError}
            </div>
          )}
          {apiSuccess && (
            <div className="p-3 rounded-lg bg-green-50 text-green-600 text-sm text-center" role="alert">
              {apiSuccess}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="nombre_completo"
              className="block text-sm font-medium text-zinc-700"
            >
              Nombre completo
            </label>
            <input
              id="nombre_completo"
              name="nombre_completo"
              type="text"
              autoComplete="name"
              placeholder="Juan Pérez García"
              value={formData.nombre_completo}
              onChange={handleChange}
              disabled={isLoading}
              className={`h-11 w-full rounded-lg border bg-white px-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 ${errors.nombre_completo
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                : "border-zinc-200 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                } disabled:bg-zinc-50`}
            />
            {errors.nombre_completo && (
              <p className="text-sm text-red-500">{errors.nombre_completo}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="correo"
              className="block text-sm font-medium text-zinc-700"
            >
              Correo electrónico
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              autoComplete="email"
              placeholder="juan.perez@institucion.com"
              value={formData.correo}
              disabled
              className="h-11 w-full rounded-lg border bg-zinc-50 px-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 border-zinc-200 cursor-not-allowed"
            />
            <p className="text-xs text-zinc-400">El correo no se puede modificar</p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="institucion"
              className="block text-sm font-medium text-zinc-700"
            >
              Institución
            </label>
            <input
              id="institucion"
              name="institucion"
              type="text"
              autoComplete="organization"
              placeholder="Universidad Ejemplo"
              value={formData.institucion}
              disabled
              className="h-11 w-full rounded-lg border bg-zinc-50 px-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 border-zinc-200 cursor-not-allowed"
            />
            <p className="text-xs text-zinc-400">La institución no se puede modificar</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-11 rounded-lg border border-zinc-200 bg-white font-semibold text-zinc-700 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 items-center justify-center rounded-lg bg-[#6543AB] font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Cambiar Contraseña
function CambiarPasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
      setApiError("");
      setApiSuccess("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.currentPassword) newErrors.currentPassword = "Contraseña actual es requerida";
    if (!formData.newPassword) newErrors.newPassword = "Nueva contraseña es requerida";
    else if (formData.newPassword.length < 8) newErrors.newPassword = "Mínimo 8 caracteres";
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setApiSuccess("");
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("/api/auth/password/change", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.message || "Error al cambiar contraseña");
        return;
      }

      setApiSuccess("Contraseña cambiada correctamente. Inicia sesión de nuevo.");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      
      // Cerrar sesión automáticamente por seguridad
      setTimeout(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }, 2000);
    } catch {
      setApiError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (apiError) setApiError("");
    if (apiSuccess) setApiSuccess("");
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

        <h2 className="text-3xl font-bold text-center text-zinc-900 mt-5">CAMBIAR CONTRASEÑA</h2>
        <p className="mt-2 text-center text-zinc-500">
          Ingresa tu contraseña actual y la nueva
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {apiError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center" role="alert">
              {apiError}
            </div>
          )}
          {apiSuccess && (
            <div className="p-3 rounded-lg bg-green-50 text-green-600 text-sm text-center" role="alert">
              {apiSuccess}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-zinc-700"
            >
              Contraseña actual
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                name="currentPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={formData.currentPassword}
                onChange={handleChange}
                disabled={isLoading}
                className={`h-11 w-full rounded-lg border bg-white pl-4 pr-12 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 ${errors.currentPassword
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
            {errors.currentPassword && <p className="text-sm text-red-500">{errors.currentPassword}</p>}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-zinc-700"
            >
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={handleChange}
                disabled={isLoading}
                className={`h-11 w-full rounded-lg border bg-white pl-4 pr-12 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 ${errors.newPassword
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
            {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword}</p>}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-zinc-700"
            >
              Confirmar nueva contraseña
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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-11 rounded-lg border border-zinc-200 bg-white font-semibold text-zinc-700 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 items-center justify-center rounded-lg bg-[#6543AB] font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Cambiando..." : "Cambiar contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AlumnoInicioPage() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>(groupsData);
  const [user, setUser] = useState<User | null>(null);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Cargar usuario desde localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }

    // Escuchar actualizaciones de usuario desde los modales
    const handleUserUpdated = (e: CustomEvent<User>) => {
      setUser(e.detail);
    };
    window.addEventListener("user-updated", handleUserUpdated as EventListener);
    return () => window.removeEventListener("user-updated", handleUserUpdated as EventListener);
  }, []);

  const toggleGroup = (groupId: number) => {
    setGroups(groups.map((g) =>
      g.id === groupId ? { ...g, expanded: !g.expanded } : g
    ));
  };

  const getSortedExams = (exams: Exam[]) => {
    return [...exams].sort((a, b) => {
      if (a.status === "upcoming" && b.status === "completed") return -1;
      if (a.status === "completed" && b.status === "upcoming") return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.push("/login");
    router.refresh();
  };

  const handleProfile = () => {
    setUserMenuOpen(false);
    setShowPerfilModal(true);
  };

  const handleChangePassword = () => {
    setUserMenuOpen(false);
    setShowPasswordModal(true);
  };

  return (
    <div className="min-h-screen bg-[#f6f6fa] flex flex-col font-sans">
      {/* Top Navigation Bar - 88px, white, full width */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#dedee8]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-22 gap-4">
            {/* Left: Logo + Institution */}
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-2xl leading-relaxed text-[#6543ab] truncate">
                Evalix
              </span>
              <span className="font-medium text-xs leading-relaxed text-[#747487] truncate">
                Instituto Tecnológico
              </span>
            </div>

            {/* Center: Tabs */}
            <nav className="hidden lg:flex items-center gap-2">
              <Link href="/alumno/inicio" className="px-4 h-10 rounded-lg bg-[#f0eafb] font-semibold text-base leading-relaxed text-[#6543ab] flex items-center justify-center">
                Inicio
              </Link>
              <Link href="/alumno/examenes" className="px-4 h-10 rounded-lg font-medium text-base leading-relaxed text-[#747487] hover:bg-[#f6f6fa] transition-colors flex items-center justify-center">
                Exámenes
              </Link>
            </nav>

            {/* Right: Mi cuenta button */}
            <div className="relative">
              <button
                className="flex items-center justify-center px-4 h-10 rounded-lg bg-[#f6f6fa] font-semibold text-sm leading-relaxed text-[#232334] hover:bg-[#ede6f8] transition-colors"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
              >
                Mi cuenta
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-[#dedee8] shadow-lg py-1 z-40">
                    <div className="px-4 py-3 border-b border-[#dedee8]">
                      <p className="text-sm font-medium text-[#232334]">{user?.nombre_completo || "Usuario"}</p>
                      <p className="text-xs text-[#747487]">{user?.correo || "correo@institucion.edu"}</p>
                    </div>
                    <button
                      onClick={handleProfile}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#232334] hover:bg-[#f6f6fa] font-medium text-left"
                    >
                      Mi perfil
                    </button>
                    <button
                      onClick={handleChangePassword}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#232334] hover:bg-[#f6f6fa] font-medium text-left"
                    >
                      Cambiar Contraseña
                    </button>
                    <hr className="my-1 border-[#dedee8]" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#ad3040] hover:bg-[#f6f6fa] font-medium text-left"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-semibold text-4xl leading-relaxed text-[#232334] tracking-tight">
            Tu espacio de aprendizaje
          </h1>
        </div>

        {/* Content Grid: 256px sidebar + rest */}
        <div className="flex gap-6">
          {/* Left Sidebar: Exámenes próximos */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white border border-[#dedee8] rounded-xl h-[424px] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#dedee8]">
                <h2 className="font-semibold text-sm leading-relaxed text-[#232334]">
                  Exámenes próximos
                </h2>
              </div>
              <div className="p-4">
                <div className="border-b border-[#dedee8] pb-4">
                  <p className="font-semibold text-xs leading-relaxed text-[#747487] whitespace-pre-wrap">
                    20 NOV  ·  11:00 h
                  </p>
                  <p className="font-medium text-base leading-relaxed text-[#232334] mt-1">
                    Sistemas Programables
                  </p>
                  <p className="font-normal text-xs leading-relaxed text-[#747487] mt-1">
                    Unidad 2
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Area */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Examen por Empezar */}
            <section>
              <h2 className="font-semibold text-sm leading-relaxed text-[#232334] mb-4">
                Examen por Empezar
              </h2>
              <div className="bg-[#e4f7fb] rounded-xl p-6 max-w-3xl min-h-[151px]">
                <p className="font-semibold text-2xl leading-relaxed text-[#232334] mb-2">
                  Programación Orientada a Objetos
                </p>
                <p className="font-normal text-sm leading-relaxed text-black mb-6">
                  Unidad 1 · 25 preguntas
                </p>
                <button className="flex items-center justify-center px-4 h-10 rounded-lg bg-[#44689e] font-semibold text-sm leading-relaxed text-white w-[151px] hover:bg-[#3a5a8a] transition-colors">
                  Entrar a examen
                </button>
              </div>
            </section>

            {/* Grupos */}
            <section>
              <h2 className="font-semibold text-lg leading-relaxed text-[#232334] mb-4">
                Grupos
              </h2>
              <div className="space-y-4 max-w-3xl">
                {groups.map((group) => {
                  const sortedExams = getSortedExams(group.exams);
                  return (
                    <div
                      key={group.id}
                      className="bg-white border border-[#dedee8] rounded-xl overflow-hidden"
                    >
                      {/* Group Header - clickable */}
                      <button
                        onClick={() => toggleGroup(group.id)}
                        className="w-full px-4 py-4 relative h-22 flex items-center justify-between gap-4 text-left"
                      >
                        <div className="absolute left-0 top-4 w-1 h-11 bg-[#95c9a4] rounded" />
                        <div className="pl-6 flex-1 min-w-0">
                          <p className="font-semibold text-base leading-relaxed text-[#232334] truncate">
                            {group.name}
                          </p>
                          <p className="font-normal text-xs leading-relaxed text-[#747487] mt-1 truncate">
                            {group.code}
                          </p>
                        </div>
                        <span className={`flex-shrink-0 font-medium text-2xl leading-relaxed text-[#6543ab] transition-transform duration-200 ${group.expanded ? "rotate-180" : ""}`}>
                          ⌄
                        </span>
                      </button>

                      {/* Expanded Content */}
                      {group.expanded && (
                        <div className="border-t border-[#dedee8] px-4 pb-4 animate-fade-in">
                          {sortedExams.length === 0 ? (
                            <p className="font-normal text-sm leading-normal text-[#747487] pt-4">
                              No hay ningún examen registrado.
                            </p>
                          ) : (
                            <div className="space-y-3 pt-4">
                              {sortedExams.map((exam) => (
                                <div
                                  key={exam.id}
                                  className={`rounded-lg p-4 ${
                                    exam.status === "upcoming"
                                      ? "bg-[#f0eafb]"
                                      : "bg-[#f6f6fa]"
                                  }`}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-base leading-normal text-[#232334]">
                                        {exam.unit}
                                      </p>
                                      <p className="font-normal text-xs leading-normal text-[#747487] mt-0.5">
                                        {exam.status === "upcoming" ? exam.date : `Examen realizado · ${exam.date}`}
                                      </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                      {exam.status === "upcoming" ? (
                                        <span className="inline-flex items-center justify-center px-3 h-7 rounded-full bg-white font-semibold text-xs leading-normal text-[#6543ab]">
                                          Próximo
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center justify-center px-3 h-7 rounded-full bg-[#e5f2e8] font-semibold text-xs leading-normal text-[#336647]">
                                          Realizado
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Modales */}
      <PerfilModal
        isOpen={showPerfilModal}
        onClose={() => setShowPerfilModal(false)}
        user={user}
      />
      <CambiarPasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}