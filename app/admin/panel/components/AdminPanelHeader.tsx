"use client";

import { LogOut, User } from "lucide-react";
import { useState } from "react";

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#dedee8]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-22 gap-4">
          {/* Left: Logo + Institution */}
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-2xl leading-relaxed text-orange-600 truncate">
              Evalix
            </span>
            <span className="font-medium text-xs leading-relaxed text-[#747487] truncate">
              {admin.institucion}
            </span>
          </div>

          {/* Right: User menu */}
          <div className="relative">
            <button
              className="flex items-center justify-center px-4 h-10 rounded-lg bg-[#f6f6fa] font-semibold text-sm leading-relaxed text-[#232334] hover:bg-[#ede6f8] transition-colors gap-2"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
              aria-label="Menú de usuario"
            >
              <User className="w-4 h-4" />
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
                    <p className="text-sm font-medium text-[#232334]">{admin.nombre_completo}</p>
                    <p className="text-xs text-[#747487]">{admin.email}</p>
                  </div>
                  <hr className="my-1 border-[#dedee8]" />
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#ad3040] hover:bg-[#f6f6fa] font-medium text-left"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4" />
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