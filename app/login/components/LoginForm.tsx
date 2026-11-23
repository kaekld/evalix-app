"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RoleSelector, { type Role } from "./RoleSelector";
import RegisterModal from "./RegisterModal";
import { Input, Button } from "@/components/ui";

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
        <h1 className="text-5xl font-bold text-center tracking-tight text-[var(--color-text-primary)]">
          INICIAR SESIÓN
        </h1>
        <p className="mt-2 text-base text-center text-[var(--color-text-secondary)]">
          Bienvenido de nuevo. Ingresa tus datos para continuar.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          <RoleSelector role={role} onChange={setRole} />

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center" role="alert">
              {error}
            </div>
          )}

          <Input
            label="Correo electrónico"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@institucion.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            error={error && !email ? "Correo electrónico requerido" : undefined}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-primary)]">
                Contraseña
              </label>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="pr-24"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition cursor-pointer disabled:opacity-50"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <a href="#" className="text-sm font-medium text-[var(--color-text-primary)] hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <Button type="submit" disabled={isLoading} loading={isLoading} className="w-full">
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>

          <p className="mt-6 text-center text-base text-[var(--color-text-secondary)]">
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              disabled={isLoading}
              className="font-medium text-[var(--color-text-primary)] hover:underline cursor-pointer disabled:opacity-50"
            >
              Regístrate
            </button>
          </p>
        </form>

        <RegisterModal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} />
      </div>
    </section>
  );
}