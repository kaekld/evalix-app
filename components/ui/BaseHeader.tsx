"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSeparator } from "./Dropdown";
import { Button } from "./Button";

export type UserRole = "ALUMNO" | "DOCENTE" | "ADMINISTRADOR";

interface User {
  id: string;
  nombre_completo: string;
  correo: string;
  institucion: string | null;
  institucion_id: string | null;
  rol: string;
}

interface NavigationLink {
  href: string;
  label: string;
  active?: boolean;
}

export interface BaseHeaderProps {
  user: User | null;
  role: UserRole;
  navigationLinks: NavigationLink[];
  onProfile: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
  brandColor?: "purple" | "orange";
  isLoading?: boolean;
}

const brandColors = {
  purple: {
    logo: "text-[#6543ab]",
    activeTab: "bg-[#f0eafb] text-[#6543ab]",
    inactiveTab: "text-[#747487] hover:bg-[#f6f6fa]",
  },
  orange: {
    logo: "text-orange-600",
    activeTab: "bg-orange-50 text-orange-600",
    inactiveTab: "text-[#747487] hover:bg-[#f6f6fa]",
  },
};

export function BaseHeader({
  user,
  role,
  navigationLinks,
  onProfile,
  onChangePassword,
  onLogout,
  brandColor = "purple",
  isLoading = false,
}: BaseHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const colors = brandColors[brandColor];

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

  // Close dropdowns on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-22 gap-4">
          {/* Left: Logo + Institution */}
          <div className="flex flex-col min-w-0 flex-1 lg:flex-none">
            <Link href="/" className="font-bold text-2xl leading-relaxed truncate" style={{ color: colors.logo.replace("text-", "") }}>
              Evalix
            </Link>
            {isLoading ? (
              <div className="h-3 w-32 animate-pulse bg-[var(--color-skeleton)] rounded" />
            ) : user?.institucion ? (
              <span className="font-medium text-xs leading-relaxed text-[var(--color-text-secondary)] truncate">
                {user.institucion}
              </span>
            ) : null}
          </div>

          {/* Center: Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 lg:mx-auto" aria-label="Navegación principal" style={{ width: "fit-content" }}>
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 h-10 rounded-lg font-medium text-base leading-relaxed transition-colors flex items-center justify-center ${
                  link.active ? colors.activeTab : colors.inactiveTab
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Mobile menu button + Mi cuenta */}
          <div className="flex items-center gap-2 lg:ml-auto">
            {/* Mobile menu trigger */}
            <button
              type="button"
              className="lg:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background)] rounded-lg transition-colors cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Menú de navegación"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* User menu */}
            <Dropdown
              open={userMenuOpen}
              onOpenChange={setUserMenuOpen}
              trigger={
                <DropdownTrigger
                  className="flex items-center justify-center px-4 h-10 rounded-lg bg-[var(--color-user-btn-bg)] font-semibold text-sm leading-relaxed text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors"
                >
                  Mi cuenta
                </DropdownTrigger>
              }
              items={
                <DropdownMenu>
                  <div className="px-4 py-3 border-b border-[var(--color-border)]">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{user?.nombre_completo || "Usuario"}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{user?.correo || "correo@institucion.edu"}</p>
                  </div>
                  <DropdownItem onClick={handleProfileClick}>Mi perfil</DropdownItem>
                  <DropdownItem onClick={handleChangePasswordClick}>Cambiar Contraseña</DropdownItem>
                  <DropdownSeparator />
                  <DropdownItem onClick={handleLogout} danger>Cerrar Sesión</DropdownItem>
                </DropdownMenu>
              }
              align="right"
              width={224}
            />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="lg:hidden animate-fade-in border-t border-[var(--color-border)] py-4">
            <nav className="flex flex-col gap-1" aria-label="Navegación principal móvil">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium text-base leading-relaxed transition-colors cursor-pointer ${
                    link.active ? colors.activeTab : colors.inactiveTab
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
              <div className="px-4 py-3">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{user?.nombre_completo || "Usuario"}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">{user?.correo || "correo@institucion.edu"}</p>
              </div>
              <button onClick={handleProfileClick} className="w-full px-4 py-3 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-background)] rounded-lg transition-colors font-medium cursor-pointer">
                Mi perfil
              </button>
              <button onClick={handleChangePasswordClick} className="w-full px-4 py-3 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-background)] rounded-lg transition-colors font-medium cursor-pointer">
                Cambiar Contraseña
              </button>
              <button onClick={handleLogout} className="w-full px-4 py-3 text-left text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] rounded-lg transition-colors font-medium cursor-pointer">
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}