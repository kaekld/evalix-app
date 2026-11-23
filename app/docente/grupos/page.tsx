"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BaseHeader } from "@/components/ui";
import CrearGrupoModal from "../components/modals/CrearGrupoModal";
import EditarGrupoModal from "../components/modals/EditarGrupoModal";
import PerfilModal from "../components/modals/PerfilModal";
import CambiarPasswordModal from "../components/modals/CambiarPasswordModal";
import { GroupCard, type DocenteGroup } from "@/components/ui";
import AddGroupCard from "../components/groups/AddGroupCard";
import EmptyState from "../components/groups/EmptyState";
import { useGrupos, Grupo } from "@/lib/hooks/useGrupos";
import { Skeleton, CardGridSkeleton } from "@/components/ui";

interface User {
  id: string;
  nombre_completo: string;
  correo: string;
  institucion: string | null;
  institucion_id: string | null;
  rol: string;
}

export default function DocenteInicioPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCrearGrupoModal, setShowCrearGrupoModal] = useState(false);
  const [grupoToEdit, setGrupoToEdit] = useState<DocenteGroup | null>(null);
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
      } finally {
        setUserLoading(false);
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

  const handleCreateGroup = async (data: { nombre: string; codigo: string; categoria: string; descripcion?: string }) => {
    try {
      await createGrupo(data);
      setShowCrearGrupoModal(false);
    } catch {
      // Error ya manejado en el hook
    }
  };

  const handleEditGroup = (grupo: DocenteGroup) => {
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

  const handleDeleteGroup = async (groupId: string | number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este grupo? Esta acción no se puede deshacer.")) {
      try {
        await deleteGrupo(String(groupId));
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

  const handleViewGroup = (groupId: string | number) => {
    router.push(`/docente/grupos/${groupId}`);
  };

  const handleViewStudents = (groupId: string | number) => {
    router.push(`/docente/grupos/${groupId}/estudiantes`);
  };

  const handleViewEvaluaciones = (groupId: string | number) => {
    router.push(`/docente/grupos/${groupId}/evaluaciones`);
  };

  const handleViewConfiguracion = (groupId: string | number) => {
    router.push(`/docente/grupos/${groupId}/configuracion`);
  };

  const navigationLinks = [
    { href: "/docente/grupos", label: "Grupos", active: true },
    { href: "/docente/evaluaciones", label: "Evaluaciones" },
    { href: "/docente/estudiantes", label: "Estudiantes" },
  ];

  const mapToDocenteGroup = (g: Grupo): DocenteGroup => ({
    id: g.id,
    nombre: g.nombre,
    codigo: g.codigo,
    categoria: g.categoria,
    descripcion: g.descripcion,
    creado_en: g.creado_en,
    estudiantes_count: g.estudiantes_count,
    expanded: g.expanded,
    evaluaciones_count: 0,
  });

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col font-sans">
      <BaseHeader
        user={user}
        role="DOCENTE"
        navigationLinks={navigationLinks}
        onProfile={handleProfile}
        onChangePassword={handleChangePassword}
        onLogout={handleLogout}
        brandColor="purple"
        isLoading={userLoading}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="font-semibold text-4xl leading-relaxed text-[var(--color-text-primary)] tracking-tight">
            Mis Grupos
          </h1>
          <p className="mt-1 font-normal text-base leading-relaxed text-[var(--color-text-secondary)]">
            Gestiona tus grupos y categorías
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
            <CardGridSkeleton count={3} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {grupos.map((group) => (
                <GroupCard
                  key={group.id}
                  group={mapToDocenteGroup(group)}
                  variant="docente"
                  onEdit={(g) => handleEditGroup(g)}
                  onDelete={(id) => handleDeleteGroup(id)}
                  onViewGroup={(id) => handleViewGroup(id)}
                  onViewStudents={(id) => handleViewStudents(id)}
                  onViewEvaluaciones={(id) => handleViewEvaluaciones(id)}
                  onViewConfiguracion={(id) => handleViewConfiguracion(id)}
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