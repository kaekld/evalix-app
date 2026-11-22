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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const docenteId = await getDocenteIdFromToken(req);
    if (!docenteId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const { grupo, error } = await verifyGrupoOwnership(id, docenteId);
    if (error || !grupo) {
      return NextResponse.json({ message: 'Grupo no encontrado' }, { status: 404 });
    }

    // TODO: Replace with actual evaluaciones table when it exists
    // For now return empty array
    return NextResponse.json([]);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const docenteId = await getDocenteIdFromToken(req);
    if (!docenteId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const { grupo, error } = await verifyGrupoOwnership(id, docenteId);
    if (error || !grupo) {
      return NextResponse.json({ message: 'Grupo no encontrado' }, { status: 404 });
    }

    // TODO: Implement when evaluaciones table exists
    return NextResponse.json(
      { message: 'Creación de evaluaciones pendiente de implementación' },
      { status: 501 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}