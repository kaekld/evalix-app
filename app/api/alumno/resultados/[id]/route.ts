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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const alumnoId = await getAlumnoIdFromToken(req);
    if (!alumnoId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const { data: grupoEstudiante, error: geError } = await supabase
      .from('grupo_estudiante')
      .select('grupo_id')
      .eq('alumno_id', alumnoId)
      .eq('activo', true);

    if (geError) {
      return NextResponse.json({ message: geError.message }, { status: 400 });
    }

    const grupoIds = (grupoEstudiante || []).map((ge: any) => ge.grupo_id);

    const { data: evaluacion, error } = await supabase
      .from('evaluacion')
      .select(`
        id,
        titulo,
        descripcion,
        fecha_inicio,
        fecha_fin,
        estado,
        tiempo_examen,
        creado_en,
        grupo_id,
        grupo:grupo_id (id, nombre, codigo)
      `)
      .eq('id', id)
      .in('grupo_id', grupoIds)
      .maybeSingle();

    if (error || !evaluacion) {
      return NextResponse.json({ message: 'Evaluación no encontrada o no asignada a tus grupos' }, { status: 404 });
    }

    const { data: preguntas, error: pregError } = await supabase
      .from('pregunta')
      .select('id, tipo, enunciado, orden')
      .eq('evaluacion_id', id)
      .order('orden', { ascending: true });

    if (pregError) {
      return NextResponse.json({ message: pregError.message }, { status: 400 });
    }

    return NextResponse.json({
      id: evaluacion.id,
      titulo: evaluacion.titulo,
      descripcion: evaluacion.descripcion,
      fecha_inicio: evaluacion.fecha_inicio,
      fecha_fin: evaluacion.fecha_fin,
      estado: evaluacion.estado,
      tiempo_examen: evaluacion.tiempo_examen,
      creado_en: evaluacion.creado_en,
      grupo_id: evaluacion.grupo_id,
      grupo_nombre: evaluacion.grupo?.[0]?.nombre || '',
      grupo_codigo: evaluacion.grupo?.[0]?.codigo || '',
      total_preguntas: (preguntas || []).length,
      calificacion: null,
      revisado: false,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}
