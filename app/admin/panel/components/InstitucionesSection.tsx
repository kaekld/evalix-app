"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, AlertCircle, Building2, Users } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter } from "@/components/ui";
import { Badge, StatusBadge } from "@/components/ui";
import { Button } from "@/components/ui";
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
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Instituciones</h2>
          <p className="text-[var(--color-text-secondary)] mt-1">Gestiona las instituciones registradas en el sistema</p>
        </div>
        <Button onClick={() => { setEditingInstitucion(null); setShowForm(true); }} icon={<Plus className="w-4 h-4" />}>
          Nueva institución
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Institutions table */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
        <Table striped hoverable>
          <TableHeader>
            <TableRow>
              <TableHead>Institución</TableHead>
              <TableHead>Dominio</TableHead>
              <TableHead>Usuarios</TableHead>
              <TableHead>Dominios</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead align="right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instituciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-secondary)]">
                  No hay instituciones registradas
                </TableCell>
              </TableRow>
            ) : (
              instituciones.map((inst) => (
                <TableRow key={inst.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="font-medium text-[var(--color-text-primary)]">{inst.nombre}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-[var(--color-text-secondary)]">{inst.dominio}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                      <Users className="w-4 h-4 text-[var(--color-text-muted)]" />
                      <span>{inst.usuarios_count}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">{inst.dominios_count}</TableCell>
                  <TableCell>
                    <StatusBadge status={inst.activo ? "active" : "inactive"} />
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingInstitucion(inst)}
                        disabled={deletingId === inst.id}
                        className="p-2 text-[var(--color-text-muted)] hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
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
                            ? "text-[var(--color-text-muted)] cursor-not-allowed"
                            : "text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]"
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {deleteError && (
          <TableFooter>
            <div className="p-4 border-t border-[var(--color-border)] bg-red-50 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {deleteError}
            </div>
          </TableFooter>
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