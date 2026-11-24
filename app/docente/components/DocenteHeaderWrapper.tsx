"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
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
  isLoading?: boolean;
}

const navigationLinksBase = [
  { href: "/docente/inicio", label: "Inicio" },
  { href: "/docente/evaluaciones", label: "Evaluaciones" },
  { href: "/docente/estudiantes", label: "Estudiantes" },
];

export default function DocenteHeaderWrapper({ user, isLoading = false }: DocenteHeaderWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(isLoading);

  // Sync loading state with prop changes
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setLoading(isLoading); }, [isLoading]);

  // Determine active link based on current pathname
  const navigationLinks = useMemo(() => {
    return navigationLinksBase.map((link) => ({
      ...link,
      active: pathname === link.href || pathname.startsWith(link.href + "/"),
    }));
  }, [pathname]);

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
      isLoading={loading || !user}
    />
  );
}