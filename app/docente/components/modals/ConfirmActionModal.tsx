"use client";

import { useState, useEffect } from "react";
import { Modal, Button } from "@/components/ui";
import { AlertCircle, CheckCircle, X } from "lucide-react";

type Variant = "warning" | "danger" | "info";

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  variant?: Variant;
  isLoading?: boolean;
}

const variantStyles = {
  warning: {
    icon: AlertCircle,
    iconColor: "text-[#b45309]",
    bgColor: "bg-[#fef3c7]",
    borderColor: "border-[#fcd34d]",
    buttonColor: "bg-[#b45309] hover:bg-[#92400e]",
  },
  danger: {
    icon: AlertCircle,
    iconColor: "text-[#ad3040]",
    bgColor: "bg-[#fef2f2]",
    borderColor: "border-[#fecaca]",
    buttonColor: "bg-[#ad3040] hover:bg-[#991b1b]",
  },
  info: {
    icon: CheckCircle,
    iconColor: "text-[#0369a1]",
    bgColor: "bg-[#eff6ff]",
    borderColor: "border-[#bfdbfe]",
    buttonColor: "bg-[#0369a1] hover:bg-[#02569b]",
  },
};

export default function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText = "Cancelar",
  variant = "warning",
  isLoading = false,
}: ConfirmActionModalProps) {
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description=""
      size="md"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            loading={isLoading}
            className={styles.buttonColor}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className={`flex items-start gap-4 p-4 rounded-lg ${styles.bgColor} border ${styles.borderColor}`}>
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${styles.iconColor}/10`}>
          <Icon className={`h-5 w-5 ${styles.iconColor}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-zinc-700">{message}</p>
        </div>
      </div>
    </Modal>
  );
}