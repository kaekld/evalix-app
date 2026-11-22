"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RoleSelector, { type Role } from "./RoleSelector";
import RegisterModal from "./RegisterModal";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>("alumno");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al iniciar sesión");
        return;
      }

      // Redirigir según el rol - el middleware validará la cookie
      const redirectPath = role === "docente" ? "/docente" : "/alumno";
      router.push(redirectPath);
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative flex w-full flex-col justify-center px-6 py-12 lg:w-3/5 lg:px-16">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-5xl font-bold text-center tracking-tight text-zinc-900">
          INICIAR SESIÓN
        </h1>
        <p className="mt-2 text-base text-center text-zinc-500">
          Bienvenido de nuevo. Ingresa tus datos para continuar.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          <RoleSelector role={role} onChange={setRole} />

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center" role="alert">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-base font-medium text-zinc-700"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@institucion.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="h-12 w-full rounded-lg border border-zinc-200 bg-white px-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 disabled:bg-zinc-50"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-base font-medium text-zinc-700"
              >
                Contraseña
              </label>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-12 w-full rounded-lg border border-zinc-200 bg-white pl-4 pr-24 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 disabled:bg-zinc-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                disabled={isLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-medium text-zinc-500 transition hover:text-zinc-900 disabled:opacity-50"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <a
              href="#"
              className="text-base font-medium text-zinc-900 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-[#6543AB] text-base font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>

          <p className="mt-6 text-center text-base text-zinc-500">
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              disabled={isLoading}
              className="font-medium text-zinc-900 hover:underline cursor-pointer disabled:opacity-50"
            >
              Regístrate
            </button>
          </p>
        </form>

        <RegisterModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
        />
      </div>
    </section>
  );
}
