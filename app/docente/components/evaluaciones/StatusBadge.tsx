"use client";

import { Evaluacion } from "./types";

interface StatusBadgeProps {
  status: Evaluacion["status"];
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const styles = {
    pendiente: {
      bg: "bg-[#f0eafb]",
      text: "text-[#6543ab]",
      label: "Pendiente",
    },
    publicada: {
      bg: "bg-[#e0f2fe]",
      text: "text-[#0369a1]",
      label: "Publicada",
    },
    finalizada: {
      bg: "bg-[#e5f2e8]",
      text: "text-[#336647]",
      label: "Finalizada",
    },
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  const s = styles[status];

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${s.bg} ${s.text} ${sizeClasses[size]}`}>
      {s.label}
    </span>
  );
}