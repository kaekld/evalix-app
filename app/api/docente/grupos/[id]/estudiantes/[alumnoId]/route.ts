import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'evalix_secret_key_2026');

async function getDocenteIdFromToken(req: Request): Promise<string | null> {
  const cookieHeader = req.headers.get('cookie') || '';
  const authCookie = cookieHeader
    .split('; ')
    .find((c) => c.startsWith('auth_token='));
  const token = authCookie ? authCookie.slice('auth_token='.length) : null;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.rol !== 'DOCENTE') return null;
    return payload.sub as string;
  } catch {
    return null;
  }
}

async function verifyGrupoOwnership(grupoId: string, docenteId: string) {
  const { data: grupo, error } = await supabase
    .from('grupo')
    .select('id, docente_id')
    .eq('id', grupoId)
    .eq('docente_id', docenteId)
    .maybeSingle();

  return { grupo, error };
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; alumnoId: string }> }) {
  try {
    const docenteId = await getDocenteIdFromToken(req);
    if (!docenteId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id, alumnoId } = await params;
    const { grupo, error } = await verifyGrupoOwnership(id, docenteId);
    if (error || !grupo) {
      return NextResponse.json({ message: 'Grupo no encontrado' }, { status: 404 });
    }

    // Check if enrollment exists
    const { data: existing } = await supabase
      .from('grupo_estudiante')
      .select('id')
      .eq('grupo_id', id)
      .eq('alumno_id', alumnoId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ message: 'El alumno no está inscrito en este grupo' }, { status: 404 });
    }

    // Soft delete (set activo = false) or hard delete
    // Using soft delete to preserve history
    const { error: updateError } = await supabase
      .from('grupo_estudiante')
      .update({ activo: false })
      .eq('grupo_id', id)
      .eq('alumno_id', alumnoId);

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Alumno desinscrito correctamente' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}