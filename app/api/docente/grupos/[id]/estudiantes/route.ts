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
}

interface AlumnoRow {
  id: string;
  matricula: string;
  usuario: UsuarioRow | Array<UsuarioRow> | null;
}

interface GrupoEstudianteRow {
  id: string;
  grupo_id: string;
  alumno_id: string;
  inscrito_en: string;
  activo: boolean;
  alumno: AlumnoRow | Array<AlumnoRow> | null;
}

interface UsuarioInstitucionRow {
  institucion_id: string;
}

interface AlumnoInstitucionRow {
  id: string;
  usuario: UsuarioInstitucionRow | Array<UsuarioInstitucionRow> | null;
}

interface GrupoEstudianteExistingRow {
  alumno_id: string;
}

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
    .select('id, docente_id, institucion_id')
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
    const { grupo, error: grupoError } = await verifyGrupoOwnership(id, docenteId);
    if (grupoError || !grupo) {
      return NextResponse.json({ message: 'Grupo no encontrado' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const activo = searchParams.get('activo');

    let query = supabase
      .from('grupo_estudiante')
      .select(`
        id,
        grupo_id,
        alumno_id,
        inscrito_en,
        activo,
        alumno:alumno_id(
          id,
          matricula,
          usuario(id, nombre_completo, correo)
        )
      `)
      .eq('grupo_id', id);

    if (activo !== null) {
      query = query.eq('activo', activo === 'true');
    }

    if (search) {
      query = query.or(`alumno.matricula.ilike.%${search}%,alumno.usuario.nombre_completo.ilike.%${search}%`);
    }

    query = query.order('inscrito_en', { ascending: false });

    const { data: estudiantes, error: queryError } = await query;

    if (queryError) {
      return NextResponse.json({ message: queryError.message }, { status: 400 });
    }

    const formatted = (estudiantes || []).map((e: GrupoEstudianteRow) => {
      const alumno = Array.isArray(e.alumno) ? e.alumno[0] : e.alumno;
      const usuario = alumno?.usuario
        ? (Array.isArray(alumno.usuario) ? alumno.usuario[0] : alumno.usuario)
        : null;
      return {
        id: e.id,
        grupo_id: e.grupo_id,
        alumno_id: e.alumno_id,
        inscrito_en: e.inscrito_en,
        activo: e.activo,
        alumno: {
          id: alumno?.id,
          matricula: alumno?.matricula,
          nombre_completo: usuario?.nombre_completo,
          correo: usuario?.correo,
        },
      };
    });

    return NextResponse.json(formatted);
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

    const body = await req.json();
    const { alumno_ids } = body; // array of alumno IDs to enroll

    if (!alumno_ids || !Array.isArray(alumno_ids) || alumno_ids.length === 0) {
      return NextResponse.json({ message: 'Se requiere al menos un alumno_id' }, { status: 400 });
    }

    // Verify all alumnos belong to the same institution
    const { data: alumnos, error: alumnosError } = await supabase
      .from('alumno')
      .select('id, usuario!inner(institucion_id)')
      .in('id', alumno_ids);

    if (alumnosError || !alumnos || alumnos.length !== alumno_ids.length) {
      return NextResponse.json({ message: 'Uno o más alumnos no encontrados' }, { status: 404 });
    }

    const invalidAlumnos = alumnos.filter(
      (a: AlumnoInstitucionRow) => {
        const usuario = Array.isArray(a.usuario) ? a.usuario[0] : a.usuario;
        return usuario?.institucion_id !== grupo.institucion_id;
      }
    );
    if (invalidAlumnos.length > 0) {
      return NextResponse.json(
        { message: 'Algunos alumnos no pertenecen a la misma institución del grupo' },
        { status: 400 },
      );
    }

    // Check which are already enrolled
    const { data: existing } = await supabase
      .from('grupo_estudiante')
      .select('alumno_id')
      .eq('grupo_id', id)
      .in('alumno_id', alumno_ids);

    const alreadyEnrolled = new Set((existing || []).map((e: GrupoEstudianteExistingRow) => e.alumno_id));
    const newAlumnoIds = alumno_ids.filter((aid: string) => !alreadyEnrolled.has(aid));

    if (newAlumnoIds.length === 0) {
      return NextResponse.json(
        { message: 'Todos los alumnos seleccionados ya están inscritos en este grupo' },
        { status: 409 },
      );
    }

    // Insert new enrollments
    const rows = newAlumnoIds.map((alumno_id: string) => ({
      grupo_id: id,
      alumno_id,
      activo: true,
    }));

    const { data: inscritos, error: insertError } = await supabase
      .from('grupo_estudiante')
      .insert(rows)
      .select('id, grupo_id, alumno_id, inscrito_en, activo');

    if (insertError) {
      return NextResponse.json({ message: insertError.message }, { status: 400 });
    }

    return NextResponse.json({
      message: `${inscritos?.length ?? 0} alumno(s) inscrito(s) correctamente`,
      inscritos: inscritos?.length ?? 0,
      ya_inscritos: alreadyEnrolled.size,
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}