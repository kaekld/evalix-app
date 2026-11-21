"use client";

import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react";

interface User {
  id: string;
  nombre_completo: string;
  correo: string;
  institucion: string | null;
  institucion_id: string | null;
  rol: string;
}

interface AlumnoHeaderProps {
  user: User | null;
  onProfile: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
}

export default function AlumnoHeader({ user, onProfile, onChangePassword, onLogout }: AlumnoHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    setUserMenuOpen(false);
    onLogout();
  };

  const handleProfileClick = () => {
    setUserMenuOpen(false);
    onProfile();
  };

  const handleChangePasswordClick = () => {
    setUserMenuOpen(false);
    onChangePassword();
  };

  const navigationLinks = [
    { href: "/alumno/inicio", label: "Inicio", active: true },
    { href: "/alumno/examenes", label: "Exámenes" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#dedee8]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-22 gap-4">
          {/* Left: Logo + Institution */}
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-2xl leading-relaxed text-[#6543ab] truncate">
              Evalix
            </span>
            <span className="font-medium text-xs leading-relaxed text-[#747487] truncate">
              {user?.institucion || "Instituto Tecnológico"}
            </span>
          </div>

          {/* Center: Tabs */}
          <nav className="hidden lg:flex items-center gap-2" aria-label="Navegación principal">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 h-10 rounded-lg font-medium text-base leading-relaxed transition-colors flex items-center justify-center ${
                  link.active
                    ? "bg-[#f0eafb] font-semibold text-[#6543ab]"
                    : "text-[#747487] hover:bg-[#f6f6fa]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Mi cuenta button */}
          <div className="relative">
            <button
              className="flex items-center justify-center px-4 h-10 rounded-lg bg-[#f6f6fa] font-semibold text-sm leading-relaxed text-[#232334] hover:bg-[#ede6f8] transition-colors"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
              aria-label="Menú de usuario"
            >
              Mi cuenta
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setUserMenuOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-[#dedee8] shadow-lg py-1 z-40" role="menu">
                  <div className="px-4 py-3 border-b border-[#dedee8]">
                    <p className="text-sm font-medium text-[#232334]">{user?.nombre_completo || "Usuario"}</p>
                    <p className="text-xs text-[#747487]">{user?.correo || "correo@institucion.edu"}</p>
                  </div>
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#232334] hover:bg-[#f6f6fa] font-medium text-left"
                    role="menuitem"
                  >
                    Mi perfil
                  </button>
                  <button
                    onClick={handleChangePasswordClick}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#232334] hover:bg-[#f6f6fa] font-medium text-left"
                    role="menuitem"
                  >
                    Cambiar Contraseña
                  </button>
                  <hr className="my-1 border-[#dedee8]" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#ad3040] hover:bg-[#f6f6fa] font-medium text-left"
                    role="menuitem"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}