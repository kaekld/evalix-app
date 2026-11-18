"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    color: "bg-purple-300",
    title: "Colabora y aprende",
    description:
      "Comparte evaluaciones, comentarios y resultados con tu equipo en un mismo espacio de trabajo.",
  },
  {
    color: "bg-violet-300",
    title: "Aprende con datos",
    description:
      "Analiza el progreso de cada persona y detecta oportunidades de mejora a tiempo.",
  },
  {
    color: "bg-indigo-300",
    title: "Crece a tu ritmo",
    description:
      "Evaluaciones y contenidos adaptados a las necesidades de cada estudiante.",
  },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [role, setRole] = useState<"alumno" | "docente">("alumno");

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeSlide]);

  const slide = slides[activeSlide];

  return (
    <main className="flex min-h-screen flex-1 bg-zinc-50">
      <section className="relative hidden w-[40%] overflow-hidden bg-purple-950 lg:block">
        {slides.map((item, index) => (
          <div
            key={item.title}
            aria-hidden={index !== activeSlide}
            className={`absolute inset-0 ${item.color} ${index === activeSlide ? "opacity-100" : "opacity-0"
              }`}
          />
        ))}

        <div className="relative z-10 flex h-full w-full flex-col p-12 text-black">
          <div className="flex flex-1 flex-col justify-center">
            <div
              key={activeSlide}
              className="animate-fade-in flex flex-col items-start"
            >
              <h2 className="max-w-md text-5xl mb-6 font-semibold leading-tight tracking-tight">
                {slide.title}
              </h2>
              <p className="mt-4 max-w-md text-lg leading-7 text-black/80">
                {slide.description}
              </p>
            </div>

            <div className="mt-24 flex w-full items-center justify-between gap-6">
              <button
                type="button"
                onClick={() =>
                  setActiveSlide(
                    (current) =>
                      (current - 1 + slides.length) % slides.length,
                  )
                }
                aria-label="Diapositiva anterior"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-950/20 text-purple-950/70 transition hover:border-purple-950/50 hover:text-purple-950"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                {slides.map((item, index) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Ir a la diapositiva ${index + 1}: ${item.title}`}
                    aria-current={index === activeSlide}
                    className={`h-2 rounded-full transition-all ${index === activeSlide
                      ? "w-8 bg-purple-950"
                      : "w-2 bg-purple-950/30 hover:bg-purple-950/50"
                      }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setActiveSlide((current) => (current + 1) % slides.length)
                }
                aria-label="Diapositiva siguiente"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-950/20 text-purple-950/70 transition hover:border-purple-950/50 hover:text-purple-950"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

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
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-zinc-100 p-1">
                <button
                  type="button"
                  onClick={() => setRole("alumno")}
                  aria-pressed={role === "alumno"}
                  className={`h-10 rounded-md text-base font-medium transition ${role === "alumno"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                    }`}
                >
                  Alumno
                </button>
                <button
                  type="button"
                  onClick={() => setRole("docente")}
                  aria-pressed={role === "docente"}
                  className={`h-10 rounded-md text-base font-medium transition ${role === "docente"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                    }`}
                >
                  Docente
                </button>
              </div>
            </div>

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
    </main>
  );
}
