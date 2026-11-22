"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DocenteHeader from "../components/DocenteHeader";
import CrearGrupoModal from "../components/modals/CrearGrupoModal";
import EditarGrupoModal from "../components/modals/EditarGrupoModal";
import PerfilModal from "../components/modals/PerfilModal";
import CambiarPasswordModal from "../components/modals/CambiarPasswordModal";
import GroupCard from "../components/groups/GroupCard";
import AddGroupCard from "../components/groups/AddGroupCard";
import EmptyState from "../components/groups/EmptyState";
import { useGrupos, Grupo } from "@/lib/hooks/useGrupos";

interface User {
  id: string;
  nombre_completo: string;
  correo: string;
  institucion: string | null;
  institucion_id: string | null;
  rol: string;
}

export default function DocenteInicioPage() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCrearGrupoModal, setShowCrearGrupoModal] = useState(false);
  const [grupoToEdit, setGrupoToEdit] = useState<Grupo | null>(null);
  const [showEditarGrupoModal, setShowEditarGrupoModal] = useState(false);
  const router = useRouter();

  const {
    grupos,
    loading,
    error,
    fetchGrupos,
    createGrupo,
    updateGrupo,
    deleteGrupo,
  } = useGrupos();

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

    const handleUserUpdated = (e: CustomEvent<User>) => {
      setUser(e.detail);
    };
    window.addEventListener("user-updated", handleUserUpdated as EventListener);

    const handleOpenPerfil = () => {
      setShowPerfilModal(true);
    };
    const handleOpenPassword = () => {
      setShowPasswordModal(true);
    };
    window.addEventListener("open-perfil-modal", handleOpenPerfil);
    window.addEventListener("open-password-modal", handleOpenPassword);

    return () => {
      window.removeEventListener("user-updated", handleUserUpdated as EventListener);
      window.removeEventListener("open-perfil-modal", handleOpenPerfil);
      window.removeEventListener("open-password-modal", handleOpenPassword);
    };
  }, []);

  // Cargar grupos al montar
  useEffect(() => {
    fetchGrupos();
  }, [fetchGrupos]);

  const toggleGroup = () => {
    // El estado expanded se maneja localmente en GroupCard
    // No necesitamos hacer nada aquí por ahora
  };

  const handleCreateGroup = async (data: { nombre: string; codigo: string; materia: string; descripcion?: string }) => {
    try {
      await createGrupo(data);
      setShowCrearGrupoModal(false);
    } catch {
      // Error ya manejado en el hook
    }
  };

  const handleEditGroup = (grupo: Grupo) => {
    setGrupoToEdit(grupo);
    setShowEditarGrupoModal(true);
  };

  const handleUpdateGroup = async (id: string, data: { nombre: string; descripcion: string; activo: boolean }) => {
    try {
      await updateGrupo(id, data);
      setShowEditarGrupoModal(false);
      setGrupoToEdit(null);
    } catch {
      // Error ya manejado en el hook
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este grupo? Esta acción no se puede deshacer.")) {
      try {
        await deleteGrupo(groupId);
      } catch {
        // Error ya manejado en el hook
      }
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleProfile = () => {
    setShowPerfilModal(true);
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  return (
    <div className="min-h-screen bg-[#f6f6fa] flex flex-col font-sans">
      <DocenteHeader
        user={user}
        onProfile={handleProfile}
        onChangePassword={handleChangePassword}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="font-semibold text-4xl leading-relaxed text-[#232334] tracking-tight">
            Mis Grupos
          </h1>
          <p className="mt-1 font-normal text-base leading-relaxed text-[#747487]">
            Gestiona tus grupos y materias
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {/* Groups Grid */}
        <section>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-[#dedee8] rounded-xl overflow-hidden animate-pulse">
                  <div className="h-14 bg-[#f6f6fa] border-b border-[#dedee8]" />
                  <div className="p-4 space-y-4">
                    <div className="h-4 bg-[#e0e0e0] rounded w-3/4" />
                    <div className="h-3 bg-[#e0e0e0] rounded w-1/2" />
                    <div className="h-3 bg-[#e0e0e0] rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {grupos.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onToggle={toggleGroup}
                  onEdit={handleEditGroup}
                  onDelete={handleDeleteGroup}
                  openDropdown={openDropdown}
                  setOpenDropdown={setOpenDropdown}
                />
              ))}

              {/* Empty State / Add New Group Card */}
              {grupos.length === 0 ? (
                <EmptyState onCreateClick={() => setShowCrearGrupoModal(true)} />
              ) : (
                <AddGroupCard onClick={() => setShowCrearGrupoModal(true)} />
              )}
            </div>
          )}
        </section>
      </main>

      {/* Modales */}
      <CrearGrupoModal
        isOpen={showCrearGrupoModal}
        onClose={() => setShowCrearGrupoModal(false)}
        onCreate={handleCreateGroup}
      />
      <EditarGrupoModal
        isOpen={showEditarGrupoModal}
        onClose={() => {
          setShowEditarGrupoModal(false);
          setGrupoToEdit(null);
        }}
        onUpdate={handleUpdateGroup}
        grupo={grupoToEdit}
      />
      <PerfilModal
        isOpen={showPerfilModal}
        onClose={() => setShowPerfilModal(false)}
        user={user}
      />
      <CambiarPasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}