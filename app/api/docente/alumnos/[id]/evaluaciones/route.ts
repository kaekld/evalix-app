import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'evalix_secret_key_2026');

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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getDocenteIdFromToken(req);
    if (!auth) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: alumnoId } = await params;
    const { searchParams } = new URL(req.url);
    const materia = searchParams.get('materia') || '';

    // Get student's groups (where they are enrolled and active)
    const { data: grupoEstudiante, error: geError } = await supabase
      .from('grupo_estudiante')
      .select(`
        grupo_id,
        grupo:grupo_id (id, nombre, codigo, docente_id)
      `)
      .eq('alumno_id', alumnoId)
      .eq('activo', true);

    if (geError || !grupoEstudiante || grupoEstudiante.length === 0) {
      return NextResponse.json({ evaluaciones: [], total: 0 });
    }

    interface GrupoEstudianteRow {
      grupo_id: string;
      grupo: Array<{ id: string; nombre: string; codigo: string; docente_id: string }> | { id: string; nombre: string; codigo: string; docente_id: string } | null;
    }

    // Filter groups that belong to this teacher
    const misGrupos = (grupoEstudiante as GrupoEstudianteRow[])
      .filter((ge) => {
        const grupo = Array.isArray(ge.grupo) ? ge.grupo[0] : ge.grupo;
        return grupo?.docente_id === auth.docenteId;
      })
      .map((ge) => {
        const grupo = Array.isArray(ge.grupo) ? ge.grupo[0] : ge.grupo;
        return grupo!;
      });

    if (misGrupos.length === 0) {
      return NextResponse.json({ evaluaciones: [], total: 0 });
    }

    const grupoIds = misGrupos.map((g) => g.id);

    // Get evaluations for these groups
    let query = supabase
      .from('evaluacion')
      .select(`
        id,
        titulo,
        descripcion,
        fecha_inicio,
        fecha_fin,
        estado,
        tiempo_por_pregunta,
        orden_aleatorio,
        creado_en,
        grupo_id,
        grupo:grupo_id (id, nombre, codigo),
        pregunta:pregunta (id, tipo, enunciado, tiempo_segundos)
      `)
      .in('grupo_id', grupoIds)
      .eq('docente_id', auth.docenteId)
      .order('creado_en', { ascending: false });

    if (materia) {
      query = query.or(`titulo.ilike.%${materia}%,grupo.nombre.ilike.%${materia}%`);
    }

    interface EvaluacionRow {
      id: string;
      titulo: string;
      descripcion: string | null;
      fecha_inicio: string;
      fecha_fin: string;
      estado: string;
      tiempo_por_pregunta: number;
      orden_aleatorio: boolean;
      creado_en: string;
      grupo_id: string;
      grupo: { id: string; nombre: string; codigo: string }[] | null;
      pregunta: { id: string }[] | null;
    }

    const { data: evaluaciones, error } = await query;

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    const formatted = (evaluaciones as EvaluacionRow[] || []).map((e) => ({
      id: e.id,
      titulo: e.titulo,
      descripcion: e.descripcion,
      fecha_inicio: e.fecha_inicio,
      fecha_fin: e.fecha_fin,
      estado: e.estado,
      tiempo_examen: e.tiempo_por_pregunta,
      orden_aleatorio: e.orden_aleatorio,
      creado_en: e.creado_en,
      grupo_id: e.grupo_id,
      grupo_nombre: e.grupo?.[0]?.nombre || '',
      grupo_codigo: e.grupo?.[0]?.codigo || '',
      total_preguntas: e.pregunta?.length || 0,
    }));

    return NextResponse.json({ evaluaciones: formatted, total: formatted.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}