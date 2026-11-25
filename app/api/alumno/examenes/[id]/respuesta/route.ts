import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const alumnoId = await getAlumnoIdFromToken(req);
    if (!alumnoId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: evaluacionId } = await params;
    const body = await req.json();
    const { pregunta_id, respuesta, tiempo_segundos, eventos } = body;

    if (!pregunta_id || respuesta === undefined) {
      return NextResponse.json({ message: 'pregunta_id y respuesta son requeridos' }, { status: 400 });
    }

    // Verificar que el intento existe y pertenece al alumno
    const { data: intento, error: intentoError } = await supabase
      .from('examen_intento')
      .select('id, estado, respuestas, pregunta_actual_idx')
      .eq('evaluacion_id', evaluacionId)
      .eq('alumno_id', alumnoId)
      .maybeSingle();

    if (intentoError || !intento) {
      return NextResponse.json({ message: 'Intento no encontrado' }, { status: 404 });
    }

    if (intento.estado === 'completado') {
      return NextResponse.json({ message: 'La evaluación ya fue completada' }, { status: 400 });
    }

    if (intento.estado === 'cancelado') {
      return NextResponse.json({ message: 'La evaluación fue cancelada' }, { status: 400 });
    }

    // Actualizar respuesta en el JSONB
    const respuestasActuales = intento.respuestas || {};
    respuestasActuales[pregunta_id] = {
      respuesta,
      tiempo_segundos: tiempo_segundos || 0,
      eventos: eventos || [],
      respondida_en: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('examen_intento')
      .update({
        respuestas: respuestasActuales,
        pregunta_actual_idx: body.siguiente_indice ?? intento.pregunta_actual_idx,
      })
      .eq('id', intento.id);

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}