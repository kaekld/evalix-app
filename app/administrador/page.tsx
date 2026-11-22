"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "./components/AdminHeader";
import DashboardCard from "./components/DashboardCard";

interface User {
  id: string;
  nombre_completo: string;
  correo: string;
  institucion: string | null;
  institucion_id: string | null;
  rol: string;
}

export default function AdministradorHomePage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Obtener usuario desde el servidor (cookie HttpOnly)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser({
            id: data.id,
            nombre_completo: data.nombre_completo || data.email,
            correo: data.email,
            institucion: data.institucion ?? null,
            institucion_id: data.institucion_id ?? null,
            rol: data.rol,
          });
        }
      } catch {
        // Usuario no autenticado, el middleware redirigirá
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleProfile = () => {
    // TODO: open profile modal
  };

  const handleChangePassword = () => {
    // TODO: open password modal
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <AdminHeader
        user={user}
        onProfile={handleProfile}
        onChangePassword={handleChangePassword}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-orange-600 mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight">
            Panel Administrador
          </h1>
          <p className="mt-4 text-lg text-zinc-600 max-w-2xl mx-auto">
            Centro de control de la plataforma. Gestión de usuarios, configuración institucional y analíticas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <DashboardCard
            href="/administrador/usuarios"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            iconHoverBgColor="bg-orange-600"
            title="Usuarios"
            description="Gestiona docentes, alumnos y administradores"
          />

          <DashboardCard
            href="/administrador/institucion"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            iconHoverBgColor="bg-orange-600"
            title="Institución"
            description="Configura datos, sedes y ajustes globales"
          />

          <DashboardCard
            href="/administrador/analiticas"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            iconHoverBgColor="bg-orange-600"
            title="Analíticas"
            description="Reportes de uso, rendimiento y estadísticas"
          />
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <DashboardCard
            href="/administrador/cursos"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            iconHoverBgColor="bg-orange-600"
            title="Cursos"
            description="Supervisa todas las materias y contenidos"
          />

          <DashboardCard
            href="/administrador/seguridad"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            iconHoverBgColor="bg-orange-600"
            title="Seguridad"
            description="Roles, permisos, auditoría y accesos"
          />

          <DashboardCard
            href="/administrador/sistema"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            iconHoverBgColor="bg-orange-600"
            title="Sistema"
            description="Logs, backups, configuración técnica"
          />
        </div>
      </main>
    </div>
  );
}