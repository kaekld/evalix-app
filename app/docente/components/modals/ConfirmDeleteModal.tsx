"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  variant?: "danger" | "warning";
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Eliminar",
  variant = "danger",
}: ConfirmDeleteModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const handleClose = () => {
    if (!isLoading) onClose();
  };

  const isDanger = variant === "danger";
  const bgColor = isDanger ? "bg-[#ad3040]" : "bg-[#b45309]";
  const hoverColor = isDanger ? "hover:bg-[#8b2635]" : "hover:bg-[#92400e]";
  const iconBgColor = isDanger ? "bg-[#fef2f2]" : "bg-[#fef3c7]";
  const iconColor = isDanger ? "text-[#ad3040]" : "text-[#b45309]";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-4 border-b border-[#dedee8] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 rounded-lg hover:bg-[#f6f6fa] transition-colors disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBgColor}`}>
              <AlertTriangle className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div className="flex-1">
              <p className="text-zinc-700">{message}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#dedee8] flex gap-3 justify-end">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 h-11 px-6 rounded-lg border border-[#dedee8] font-semibold text-sm text-zinc-700 transition hover:bg-[#f6f6fa] focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 h-11 px-6 rounded-lg ${bgColor} font-semibold text-sm text-white transition ${hoverColor} focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? "Eliminando..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}