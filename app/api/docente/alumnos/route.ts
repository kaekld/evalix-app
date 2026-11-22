import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'evalix_secret_key_2026');

interface UsuarioRow {
  id: string;
  nombre_completo: string;
  correo: string;
  activo: boolean;
}

interface AlumnoRow {
  id: string;
  matricula: string;
  usuario: UsuarioRow | Array<UsuarioRow> | null;
}

interface GrupoEstudianteEnrolledRow {
  alumno_id: string;
}

async function getDocenteIdFromToken(req: Request): Promise<{ docenteId: string; institucionId: string } | null> {
  const cookieHeader = req.headers.get('cookie') || '';
  const authCookie = cookieHeader
    .split('; ')
    .find((c) => c.startsWith('auth_token='));
  const token = authCookie ? authCookie.slice('auth_token='.length) : null;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.rol !== 'DOCENTE') return null;

    const docenteId = payload.sub as string;

    // Get docente's institution
    const { data: docente, error } = await supabase
      .from('docente')
      .select('id, usuario!inner(institucion_id)')
      .eq('id', docenteId)
      .maybeSingle();

    if (error || !docente) return null;

    const docenteData = docente as { usuario: Array<{ institucion_id: string }> | { institucion_id: string } | null };
    const institucionId = docenteData.usuario
      ? Array.isArray(docenteData.usuario)
        ? docenteData.usuario[0]?.institucion_id
        : docenteData.usuario.institucion_id
      : null;
    if (!institucionId) return null;

    return { docenteId, institucionId };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const auth = await getDocenteIdFromToken(req);
    if (!auth) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const grupoId = searchParams.get('grupo_id') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build base query for active alumnos in the same institution
    let query = supabase
      .from('alumno')
      .select(`
        id,
        matricula,
        usuario(id, nombre_completo, correo, activo)
      `, { count: 'exact' })
      .eq('usuario.activo', true)
      .eq('usuario.institucion_id', auth.institucionId);

    if (search) {
      query = query.ilike('matricula', `%${search}%`);
    }

    // Exclude already enrolled in this grupo
    if (grupoId) {
      const { data: enrolled } = await supabase
        .from('grupo_estudiante')
        .select('alumno_id')
        .eq('grupo_id', grupoId)
        .eq('activo', true);

      const enrolledIds = (enrolled || []).map((e: GrupoEstudianteEnrolledRow) => e.alumno_id);
      if (enrolledIds.length > 0) {
        query = query.not('id', 'in', `(${enrolledIds.join(',')})`);
      }
    }

    query = query
      .order('matricula')
      .range(offset, offset + limit - 1);

    const { data: alumnos, error, count } = await query;

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    const formatted = (alumnos || []).map((a: AlumnoRow) => {
      const usuario = Array.isArray(a.usuario) ? a.usuario[0] : a.usuario;
      return {
        id: a.id,
        matricula: a.matricula,
        nombre_completo: usuario?.nombre_completo,
        correo: usuario?.correo,
      };
    });

    return NextResponse.json({
      alumnos: formatted,
      total: count ?? 0,
      limit,
      offset,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}