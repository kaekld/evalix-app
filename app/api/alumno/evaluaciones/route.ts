import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'evalix_secret_key_2026');

async function getAlumnoIdFromToken(req: Request): Promise<string | null> {
  const cookieHeader = req.headers.get('cookie') || '';
  const authCookie = cookieHeader
    .split('; ')
    .find((c) => c.startsWith('auth_token='));
  const token = authCookie ? authCookie.slice('auth_token='.length) : null;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.rol !== 'ALUMNO') return null;
    return payload.sub as string;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const alumnoId = await getAlumnoIdFromToken(req);
    if (!alumnoId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado');

    const { data: grupoEstudiante, error: geError } = await supabase
      .from('grupo_estudiante')
      .select('grupo_id')
      .eq('alumno_id', alumnoId)
      .eq('activo', true);

    if (geError) {
      return NextResponse.json({ message: geError.message }, { status: 400 });
    }

    const grupoIds = (grupoEstudiante || []).map((ge: any) => ge.grupo_id);

    if (grupoIds.length === 0) {
      return NextResponse.json([]);
    }

    let query = supabase
      .from('evaluacion')
      .select(`
        id,
        titulo,
        descripcion,
        fecha_inicio,
        fecha_fin,
        estado,
        tiempo_examen,
        orden_aleatorio,
        creado_en,
        actualizado_en,
        grupo_id,
        grupo:grupo_id (id, nombre, codigo),
        pregunta:pregunta (id)
      `)
      .in('grupo_id', grupoIds)
      .order('creado_en', { ascending: false });

    if (estado) {
      query = query.eq('estado', estado);
    }

    const { data: evaluaciones, error } = await query;

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    const formatted = (evaluaciones || []).map((e: any) => ({
      id: e.id,
      titulo: e.titulo,
      descripcion: e.descripcion,
      fecha_inicio: e.fecha_inicio,
      fecha_fin: e.fecha_fin,
      estado: e.estado,
      tiempo_examen: e.tiempo_examen,
      orden_aleatorio: e.orden_aleatorio,
      creado_en: e.creado_en,
      actualizado_en: e.actualizado_en,
      grupo_id: e.grupo_id,
      grupo_nombre: e.grupo?.[0]?.nombre || '',
      grupo_codigo: e.grupo?.[0]?.codigo || '',
      total_preguntas: e.pregunta?.length || 0,
    }));

    return NextResponse.json(formatted);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}
