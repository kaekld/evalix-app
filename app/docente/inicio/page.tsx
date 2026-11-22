"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DocenteHeader from "../components/DocenteHeader";
import CrearGrupoModal from "../components/modals/CrearGrupoModal";
import PerfilModal from "../components/modals/PerfilModal";
import CambiarPasswordModal from "../components/modals/CambiarPasswordModal";
import GroupCard from "../components/groups/GroupCard";
import AddGroupCard from "../components/groups/AddGroupCard";
import EmptyState from "../components/groups/EmptyState";

interface Group {
  id: number;
  name: string;
  code: string;
  subject: string;
  studentsCount: number;
  examsCount: number;
  createdAt: string;
  expanded: boolean;
}

interface User {
  id: string;
  nombre_completo: string;
  correo: string;
  institucion: string | null;
  institucion_id: string | null;
  rol: string;
}

const groupsData: Group[] = [
  {
    id: 1,
    name: "Programación Orientada a Objetos",
    code: "POO-2026-A",
    subject: "Programación",
    studentsCount: 24,
    examsCount: 3,
    createdAt: "2026-09-15",
    expanded: false,
  },
  {
    id: 2,
    name: "Sistemas Programables",
    code: "SIS-2026-B",
    subject: "Sistemas",
    studentsCount: 18,
    examsCount: 2,
    createdAt: "2026-09-20",
    expanded: false,
  },
  {
    id: 3,
    name: "Estructuras de Datos",
    code: "EDA-2026-A",
    subject: "Estructuras de Datos",
    studentsCount: 32,
    examsCount: 4,
    createdAt: "2026-10-01",
    expanded: false,
  },
];

export default function DocenteInicioPage() {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [groups, setGroups] = useState<Group[]>(groupsData);
  const [user, setUser] = useState<User | null>(null);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCrearGrupoModal, setShowCrearGrupoModal] = useState(false);
  const router = useRouter();

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
            institucion: null,
            institucion_id: null,
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
    return () => window.removeEventListener("user-updated", handleUserUpdated as EventListener);
  }, []);

  const toggleGroup = (groupId: number) => {
    setGroups(groups.map((g) =>
      g.id === groupId ? { ...g, expanded: !g.expanded } : g
    ));
  };

  const handleCreateGroup = (data: Partial<Group>) => {
    const newGroup: Group = {
      id: Date.now(),
      name: data.name || "",
      code: data.code || "",
      subject: data.subject || "",
      studentsCount: 0,
      examsCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      expanded: true,
    };
    setGroups([newGroup, ...groups]);
  };

  const handleDeleteGroup = (groupId: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este grupo? Esta acción no se puede deshacer.")) {
      setGroups(groups.filter(g => g.id !== groupId));
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

        {/* Groups Grid */}
        <section>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onToggle={toggleGroup}
                onDelete={handleDeleteGroup}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
              />
            ))}

            {/* Empty State / Add New Group Card */}
            {groups.length === 0 ? (
              <EmptyState onCreateClick={() => setShowCrearGrupoModal(true)} />
            ) : (
              <AddGroupCard onClick={() => setShowCrearGrupoModal(true)} />
            )}
          </div>
        </section>
      </main>

      {/* Modales */}
      <CrearGrupoModal
        isOpen={showCrearGrupoModal}
        onClose={() => setShowCrearGrupoModal(false)}
        onCreate={handleCreateGroup}
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