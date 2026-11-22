"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminPanelHeader from "./AdminPanelHeader";
import InstitucionesSection from "./InstitucionesSection";
import DominiosSection from "./DominiosSection";

interface Admin {
  id: string;
  email: string;
  nombre_completo: string;
  institucion: string;
  institucion_id: string;
}

export default function AdminPanel({ admin }: { admin: Admin }) {
  const [activeTab, setActiveTab] = useState<"instituciones" | "dominios">("instituciones");
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#f6f6fa] flex flex-col">
      <AdminPanelHeader admin={admin} onLogout={handleLogout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-zinc-200">
          <button
            onClick={() => setActiveTab("instituciones")}
            className={`px-6 py-3 font-medium text-base border-b-2 transition-colors ${
              activeTab === "instituciones"
                ? "border-orange-600 text-orange-600"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            Instituciones
          </button>
          <button
            onClick={() => setActiveTab("dominios")}
            className={`px-6 py-3 font-medium text-base border-b-2 transition-colors ${
              activeTab === "dominios"
                ? "border-orange-600 text-orange-600"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            Dominios permitidos
          </button>
        </div>

        {activeTab === "instituciones" && <InstitucionesSection />}
        {activeTab === "dominios" && <DominiosSection />}
      </main>
    </div>
  );
}