"use client";

import { useRouter } from "next/navigation";
import DocenteHeader from "./DocenteHeader";

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

export default function DocenteHeaderWrapper({ user }: DocenteHeaderWrapperProps) {
  const router = useRouter();

  const handleProfile = () => {
    // Dispatch event to open perfil modal in parent
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
    <DocenteHeader
      user={user}
      onProfile={handleProfile}
      onChangePassword={handleChangePassword}
      onLogout={handleLogout}
    />
  );
}