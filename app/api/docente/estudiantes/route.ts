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

interface GrupoRow {
  id: string;
  nombre: string;
  codigo: string;
}

interface GrupoEstudianteRow {
  id: string;
  grupo_id: string;
  alumno_id: string;
  inscrito_en: string;
  activo: boolean;
  alumno: AlumnoRow | Array<AlumnoRow> | null;
  grupo: GrupoRow | Array<GrupoRow> | null;
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
    const activo = searchParams.get('activo');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // First get teacher's groups
    const { data: grupos, error: gruposError } = await supabase
      .from('grupo')
      .select('id, nombre, codigo')
      .eq('docente_id', auth.docenteId);

    if (gruposError || !grupos || grupos.length === 0) {
      return NextResponse.json({ estudiantes: [], total: 0, limit, offset });
    }

    const grupoIds = grupos.map(g => g.id);
    const grupoMap = new Map(grupos.map(g => [g.id, { nombre: g.nombre, codigo: g.codigo }]));

    // Filter by specific grupo if provided
    const targetGrupoIds = grupoId ? [grupoId] : grupoIds;

    // Build query for grupo_estudiante
    let query = supabase
      .from('grupo_estudiante')
      .select(`
        id,
        grupo_id,
        alumno_id,
        inscrito_en,
        activo,
        alumno:alumno_id (
          id,
          matricula,
          usuario (id, nombre_completo, correo, activo)
        ),
        grupo:grupo_id (id, nombre, codigo)
      `, { count: 'exact' })
      .in('grupo_id', targetGrupoIds);

    if (activo !== null) {
      query = query.eq('activo', activo === 'true');
    }

    if (search) {
      query = query.or(`alumno.matricula.ilike.%${search}%,alumno.usuario.nombre_completo.ilike.%${search}%,alumno.usuario.correo.ilike.%${search}%`);
    }

    query = query
      .order('inscrito_en', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: estudiantes, error, count } = await query;

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    const formatted = (estudiantes || []).map((e: GrupoEstudianteRow) => {
      const alumno = Array.isArray(e.alumno) ? e.alumno[0] : e.alumno;
      const usuario = alumno?.usuario
        ? (Array.isArray(alumno.usuario) ? alumno.usuario[0] : alumno.usuario)
        : null;
      const grupo = Array.isArray(e.grupo) ? e.grupo[0] : e.grupo;
      return {
        id: e.id,
        grupo_id: e.grupo_id,
        grupo_nombre: grupo?.nombre || '',
        grupo_codigo: grupo?.codigo || '',
        alumno_id: e.alumno_id,
        inscrito_en: e.inscrito_en,
        activo: e.activo,
        alumno: {
          id: alumno?.id,
          matricula: alumno?.matricula,
          nombre_completo: usuario?.nombre_completo,
          correo: usuario?.correo,
          usuario_activo: usuario?.activo ?? true,
        },
      };
    });

    return NextResponse.json({
      estudiantes: formatted,
      total: count ?? 0,
      limit,
      offset,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}