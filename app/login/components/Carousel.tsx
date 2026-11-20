"use client";

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

export default function Carousel() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeSlide]);

  const slide = slides[activeSlide];

  return (
    <section className="relative hidden w-[40%] bg-purple-950 lg:block">
      {/* Background slides with overflow hidden */}
      <div className="absolute inset-0 overflow-hidden">
        {slides.map((item, index) => (
          <div
            key={item.title}
            aria-hidden={index !== activeSlide}
            className={`absolute inset-0 ${item.color} ${index === activeSlide ? "opacity-100" : "opacity-0"
              }`}
          />
        ))}
      </div>

      {/* Content and navigation */}
      <div className="relative z-10 flex h-full w-full flex-col p-12 text-black">
        <div className="flex flex-1 flex-col justify-center">
          <div
            key={activeSlide}
            className="animate-fade-in flex flex-col items-start"
          >
            <h2 className="max-w-md text-6xl mb-6 font-semibold leading-tight tracking-tight">
              {slide.title}
            </h2>
            <p className="mt-4 max-w-md text-xl leading-7 text-black/80">
              {slide.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
