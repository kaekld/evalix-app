"use client";

import { useState } from "react";
import RoleSelector, { type Role } from "./RoleSelector";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>("alumno");

  return (
    <section className="relative flex w-full flex-col justify-center px-6 py-12 lg:w-[60%] lg:px-16">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-5xl font-bold text-center tracking-tight text-zinc-900">
          INICIAR SESIÓN
        </h1>
        <p className="mt-2 text-base text-center text-zinc-500">
          Bienvenido de nuevo. Ingresa tus datos para continuar.
        </p>

        <form
          className="mt-8 space-y-5"
          onSubmit={(event) => event.preventDefault()}
        >
          <RoleSelector role={role} onChange={setRole} />

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
              className="h-12 w-full rounded-lg border border-zinc-200 bg-white px-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
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
                className="h-12 w-full rounded-lg border border-zinc-200 bg-white pl-4 pr-24 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-medium text-zinc-500 transition hover:text-zinc-900"
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
            className="flex h-12 w-full items-center justify-center rounded-lg bg-[#6543AB] text-base font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </section>
  );
}
