"use client";

import { BaseHeader } from "@/components/ui";

interface Admin {
  id: string;
  email: string;
  nombre_completo: string;
  institucion: string;
  institucion_id: string;
}

interface AdminPanelHeaderProps {
  admin: Admin;
  onLogout: () => void;
}

export default function AdminPanelHeader({ admin, onLogout }: AdminPanelHeaderProps) {
  const user = {
    id: admin.id,
    nombre_completo: admin.nombre_completo,
    correo: admin.email,
    institucion: admin.institucion,
    institucion_id: admin.institucion_id,
    rol: "ADMINISTRADOR",
  };

  return (
    <BaseHeader
      user={user}
      role="ADMINISTRADOR"
      navigationLinks={[]}
      onProfile={() => {}}
      onChangePassword={() => {}}
      onLogout={onLogout}
      brandColor="orange"
    />
  );
}