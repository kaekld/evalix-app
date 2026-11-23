"use client";

import { useRouter } from "next/navigation";
import { BaseHeader } from "@/components/ui";

interface User {
  id: string;
  nombre_completo: string;
  correo: string;
  institucion: string | null;
  institucion_id: string | null;
  rol: string;
}

interface DocenteHeaderWrapperProps {
  user: User | null;
}

const navigationLinks = [
  { href: "/docente/inicio", label: "Inicio" },
  { href: "/docente/evaluaciones", label: "Evaluaciones" },
  { href: "/docente/estudiantes", label: "Estudiantes" },
];

export default function DocenteHeaderWrapper({ user }: DocenteHeaderWrapperProps) {
  const router = useRouter();

  const handleProfile = () => {
    window.dispatchEvent(new CustomEvent("open-perfil-modal"));
  };

  const handleChangePassword = () => {
    window.dispatchEvent(new CustomEvent("open-password-modal"));
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <BaseHeader
      user={user}
      role="DOCENTE"
      navigationLinks={navigationLinks}
      onProfile={handleProfile}
      onChangePassword={handleChangePassword}
      onLogout={handleLogout}
      brandColor="purple"
    />
  );
}