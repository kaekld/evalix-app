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
    const { respuestas_finales, tiempo_total_segundos } = body;

    // Verificar que el intento existe y pertenece al alumno
    const { data: intento, error: intentoError } = await supabase
      .from('examen_intento')
      .select('id, estado, respuestas, iniciado_en, evaluacion_id')
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

    // Combinar respuestas finales con las ya guardadas
    const respuestasCompletas = {
      ...(intento.respuestas || {}),
      ...(respuestas_finales || {}),
    };

    // Calificar automáticamente preguntas cerradas
    const { data: evaluacion, error: evalError } = await supabase
      .from('evaluacion')
      .select(`
        id,
        pregunta:pregunta (
          id,
          tipo,
          opcion:opcion (id, es_correcta)
        )
      `)
      .eq('id', evaluacionId)
      .single();

    let autoCalificadas = 0;
    let totalCerradas = 0;

    if (!evalError && evaluacion?.pregunta) {
      for (const pregunta of evaluacion.pregunta) {
        if (pregunta.tipo === 'cerrada') {
          totalCerradas++;
          const respuestaAlumno = respuestasCompletas[pregunta.id]?.respuesta;
          if (respuestaAlumno) {
            const opcionCorrecta = pregunta.opcion?.find((o: any) => o.es_correcta);
            if (opcionCorrecta && respuestaAlumno === opcionCorrecta.id) {
              autoCalificadas++;
              // Marcar como correcta en la respuesta
              if (respuestasCompletas[pregunta.id]) {
                respuestasCompletas[pregunta.id].auto_calificada = true;
                respuestasCompletas[pregunta.id].correcta = true;
              }
            } else {
              if (respuestasCompletas[pregunta.id]) {
                respuestasCompletas[pregunta.id].auto_calificada = true;
                respuestasCompletas[pregunta.id].correcta = false;
              }
            }
          }
        }
      }
    }

    // Calcular tiempo total si no se proporciona
    const iniciadoEn = new Date(intento.iniciado_en).getTime();
    const finalizadoEn = Date.now();
    const tiempoCalculado = tiempo_total_segundos || Math.floor((finalizadoEn - iniciadoEn) / 1000);

    // Actualizar intento como completado
    const { error: updateError } = await supabase
      .from('examen_intento')
      .update({
        estado: 'completado',
        finalizado_en: new Date().toISOString(),
        tiempo_total_segundos: tiempoCalculado,
        respuestas: respuestasCompletas,
      })
      .eq('id', intento.id);

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      auto_calificadas: autoCalificadas,
      total_cerradas: totalCerradas,
      tiempo_total_segundos: tiempoCalculado,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}