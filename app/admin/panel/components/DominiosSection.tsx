"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, AlertCircle, Globe } from "lucide-react";
import DominioForm from "./DominioForm";

interface Dominio {
  id: string;
  dominio: string;
  tipo: string;
  activo: boolean;
  institucion_id: string;
  institucion_nombre: string;
}

export default function DominiosSection() {
  const [dominios, setDominios] = useState<Dominio[]>([]);
  const [instituciones, setInstituciones] = useState<{ id: string; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDominio, setEditingDominio] = useState<Dominio | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [domsRes, instsRes] = await Promise.all([
        fetch("/api/admin/dominios"),
        fetch("/api/admin/instituciones"),
      ]);
      if (!domsRes.ok) {
        const data = await domsRes.json();
        throw new Error(data.message || "Error al cargar dominios");
      }
      if (!instsRes.ok) {
        const data = await instsRes.json();
        throw new Error(data.message || "Error al cargar instituciones");
      }
      const domsData = await domsRes.json();
      const instsData = await instsRes.json();
      setDominios(domsData);
      setInstituciones(instsData.map((i: { id: string; nombre: string }) => ({ id: i.id, nombre: i.nombre })));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Carga inicial de datos
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleCreate = async (formData: { dominio: string; tipo: string; institucion_id: string }) => {
    setError("");
    try {
      const res = await fetch("/api/admin/dominios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al crear dominio");
      }
      setShowForm(false);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear dominio");
    }
  };

  const handleUpdate = async (formData: { dominio: string; tipo: string; institucion_id: string }) => {
    if (!editingDominio) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/dominios/${editingDominio.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al actualizar dominio");
      }
      setEditingDominio(null);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al actualizar dominio");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/dominios/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al eliminar dominio");
      }
      fetchData();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Error al eliminar dominio");
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
          <h2 className="text-2xl font-bold text-zinc-900">Dominios permitidos</h2>
          <p className="text-zinc-500 mt-1">Gestiona los dominios de correo autorizados por institución y rol</p>
        </div>
        <button
          onClick={() => { setEditingDominio(null); setShowForm(true); }}
          disabled={instituciones.length === 0}
          className="flex items-center gap-2 px-4 h-10 rounded-lg bg-orange-600 text-white font-medium text-sm hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Nuevo dominio
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {instituciones.length === 0 && (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700">
          <AlertCircle className="w-5 h-5 inline-block mr-2" />
          No hay instituciones registradas. Crea una institución primero para poder agregar dominios.
        </div>
      )}

      {/* Dominios table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f6f6fa] border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">Dominio</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">Institución</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {dominios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No hay dominios registrados
                  </td>
                </tr>
              ) : (
                dominios.map((dom) => (
                  <tr key={dom.id} className="hover:bg-[#fafafa]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-zinc-900 font-mono text-sm">{dom.dominio}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{dom.institucion_nombre}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-zinc-100 text-zinc-700">
                        {dom.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        dom.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {dom.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingDominio(dom)}
                          disabled={deletingId === dom.id}
                          className="p-2 text-zinc-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(dom.id)}
                          disabled={deletingId === dom.id}
                          className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Eliminar"
                        >
                          {deletingId === dom.id ? (
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
      {(showForm || editingDominio) && (
        <DominioForm
          isOpen
          onClose={() => { setShowForm(false); setEditingDominio(null); setError(""); }}
          onSubmit={editingDominio ? handleUpdate : handleCreate}
          initialData={editingDominio || null}
          instituciones={instituciones}
          isLoading={deletingId !== null}
          title={editingDominio ? "Editar dominio" : "Nuevo dominio"}
        />
      )}
    </div>
  );
}