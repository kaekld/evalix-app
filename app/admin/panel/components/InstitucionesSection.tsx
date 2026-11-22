"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, AlertCircle, Building2, Users } from "lucide-react";
import InstitucionForm from "./InstitucionForm";

interface Institucion {
  id: string;
  nombre: string;
  dominio: string;
  activo: boolean;
  usuarios_count: number;
  dominios_count: number;
}

export default function InstitucionesSection() {
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingInstitucion, setEditingInstitucion] = useState<Institucion | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const fetchInstituciones = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/instituciones");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al cargar instituciones");
      }
      const data = await res.json();
      setInstituciones(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar instituciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Carga inicial de instituciones
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInstituciones();
  }, []);

  const handleCreate = async (formData: { nombre: string; dominio: string }) => {
    setError("");
    try {
      const res = await fetch("/api/admin/instituciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al crear institución");
      }
      setShowForm(false);
      fetchInstituciones();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear institución");
    }
  };

  const handleUpdate = async (formData: { nombre: string; dominio: string }) => {
    if (!editingInstitucion) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/instituciones/${editingInstitucion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al actualizar institución");
      }
      setEditingInstitucion(null);
      fetchInstituciones();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al actualizar institución");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/instituciones/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al eliminar institución");
      }
      fetchInstituciones();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Error al eliminar institución");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Instituciones</h2>
          <p className="text-zinc-500 mt-1">Gestiona las instituciones registradas en el sistema</p>
        </div>
        <button
          onClick={() => { setEditingInstitucion(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 h-10 rounded-lg bg-orange-600 text-white font-medium text-sm hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva institución
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Institutions table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f6f6fa] border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">Institución</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">Dominio</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">Usuarios</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">Dominios</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {instituciones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No hay instituciones registradas
                  </td>
                </tr>
              ) : (
                instituciones.map((inst) => (
                  <tr key={inst.id} className="hover:bg-[#fafafa]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-orange-600" />
                        </div>
                        <span className="font-medium text-zinc-900">{inst.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 font-mono text-sm">{inst.dominio}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-zinc-600">
                        <Users className="w-4 h-4 text-zinc-400" />
                        <span>{inst.usuarios_count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{inst.dominios_count}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        inst.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {inst.activo ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingInstitucion(inst)}
                          disabled={deletingId === inst.id}
                          className="p-2 text-zinc-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(inst.id)}
                          disabled={deletingId === inst.id || inst.usuarios_count > 0}
                          className={`p-2 transition-colors rounded-lg ${
                            inst.usuarios_count > 0
                              ? "text-zinc-300 cursor-not-allowed"
                              : "text-zinc-500 hover:text-red-600 hover:bg-red-50"
                          }`}
                          title={inst.usuarios_count > 0 ? "No se puede eliminar: tiene usuarios asociados" : "Eliminar"}
                        >
                          {deletingId === inst.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {deleteError && (
          <div className="p-4 border-t border-zinc-200 bg-red-50 text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {deleteError}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showForm || editingInstitucion) && (
        <InstitucionForm
          isOpen
          onClose={() => { setShowForm(false); setEditingInstitucion(null); setError(""); }}
          onSubmit={editingInstitucion ? handleUpdate : handleCreate}
          initialData={editingInstitucion || null}
          isLoading={deletingId !== null}
          title={editingInstitucion ? "Editar institución" : "Nueva institución"}
        />
      )}
    </div>
  );
}