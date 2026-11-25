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

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const alumnoId = await getAlumnoIdFromToken(req);
    if (!alumnoId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id: evaluacionId } = await params;

    // Verificar que la evaluación existe, está publicada y el alumno está en el grupo
    const { data: evaluacion, error: evalError } = await supabase
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
        grupo_id,
        grupo:grupo_id (id, nombre, codigo),
        pregunta:pregunta (
          id,
          tipo,
          enunciado,
          imagen_url,
          tiempo_segundos,
          orden,
          opcion:opcion (
            id,
            texto,
            orden
          )
        )
      `)
      .eq('id', evaluacionId)
      .eq('estado', 'publicada')
      .single();

    if (evalError || !evaluacion) {
      return NextResponse.json({ message: 'Evaluación no encontrada o no disponible' }, { status: 404 });
    }

    // Verificar que el alumno está en el grupo y activo
    const { data: grupoEstudiante, error: geError } = await supabase
      .from('grupo_estudiante')
      .select('id, activo')
      .eq('grupo_id', evaluacion.grupo_id)
      .eq('alumno_id', alumnoId)
      .eq('activo', true)
      .maybeSingle();

    if (geError || !grupoEstudiante) {
      return NextResponse.json({ message: 'No estás inscrito en esta evaluación' }, { status: 403 });
    }

    // Verificar horario: la evaluación debe estar dentro de fecha_inicio y fecha_fin
    const now = new Date();
    const fechaInicio = new Date(evaluacion.fecha_inicio);
    const fechaFin = new Date(evaluacion.fecha_fin);

    if (now < fechaInicio) {
      return NextResponse.json({ message: 'La evaluación aún no ha comenzado' }, { status: 400 });
    }
    if (now > fechaFin) {
      return NextResponse.json({ message: 'La evaluación ya ha finalizado' }, { status: 400 });
    }

    // Verificar si ya existe un intento
    const { data: intentoExistente, error: intentoError } = await supabase
      .from('examen_intento')
      .select('id, estado, pregunta_actual_idx, respuestas, iniciado_en')
      .eq('evaluacion_id', evaluacionId)
      .eq('alumno_id', alumnoId)
      .maybeSingle();

    let intento;

    if (intentoExistente) {
      // Si ya completó, no puede volver a iniciar
      if (intentoExistente.estado === 'completado') {
        return NextResponse.json({ message: 'Ya has completado esta evaluación' }, { status: 400 });
      }
      // Si está en curso o incidencia, continuar el intento existente
      intento = intentoExistente;
    } else {
      // Crear nuevo intento
      const { data: nuevoIntento, error: insertError } = await supabase
        .from('examen_intento')
        .insert({
          evaluacion_id: evaluacionId,
          alumno_id: alumnoId,
          estado: 'en_curso',
          pregunta_actual_idx: 0,
          respuestas: {},
        })
        .select('id, estado, pregunta_actual_idx, respuestas, iniciado_en')
        .single();

      if (insertError) {
        return NextResponse.json({ message: insertError.message }, { status: 400 });
      }
      intento = nuevoIntento;
    }

    // Preparar preguntas para el frontend
    const preguntas = (evaluacion.pregunta || [])
      .sort((a, b) => a.orden - b.orden)
      .map((p: any) => ({
        id: p.id,
        tipo: p.tipo,
        enunciado: p.enunciado,
        imagen_url: p.imagen_url,
        tiempo_segundos: p.tiempo_segundos,
        orden: p.orden,
        opciones: (p.opcion || [])
          .sort((a: any, b: any) => a.orden - b.orden)
          .map((o: any) => ({
            id: o.id,
            texto: o.texto,
            orden: o.orden,
          })),
      }));

    // Si orden_aleatorio, mezclar (pero mantener orden determinístico por sesión)
    let preguntasFinales = preguntas;
    if (evaluacion.orden_aleatorio) {
      // Usar un seed basado en evaluacionId + alumnoId para consistencia
      const seed = evaluacionId + alumnoId;
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
      }
      // Fisher-Yates shuffle con seed determinístico
      preguntasFinales = [...preguntas];
      for (let i = preguntasFinales.length - 1; i > 0; i--) {
        hash = (hash * 1664525 + 1013904223) & 0xffffffff;
        const j = Math.abs(hash) % (i + 1);
        [preguntasFinales[i], preguntasFinales[j]] = [preguntasFinales[j], preguntasFinales[i]];
      }
      // Re-asignar orden
      preguntasFinales.forEach((p, idx) => { p.orden = idx; });
    }

    // Calcular tiempo restante si hay intento previo
    const tiempoTranscurrido = Math.floor((now.getTime() - new Date(intento.iniciado_en).getTime()) / 1000);
    const tiempoTotalExamen = evaluacion.tiempo_examen * 60; // minutos a segundos
    const tiempoRestante = Math.max(0, tiempoTotalExamen - tiempoTranscurrido);

    return NextResponse.json({
      intento: {
        id: intento.id,
        estado: intento.estado,
        pregunta_actual_idx: intento.pregunta_actual_idx,
        respuestas: intento.respuestas || {},
        iniciado_en: intento.iniciado_en,
      },
      evaluacion: {
        id: evaluacion.id,
        titulo: evaluacion.titulo,
        descripcion: evaluacion.descripcion,
        fecha_inicio: evaluacion.fecha_inicio,
        fecha_fin: evaluacion.fecha_fin,
        tiempo_examen: evaluacion.tiempo_examen, // minutos totales
        orden_aleatorio: evaluacion.orden_aleatorio,
        grupo_id: evaluacion.grupo_id,
        grupo_nombre: evaluacion.grupo?.[0]?.nombre || '',
      },
      preguntas: preguntasFinales,
      tiempo_restante_segundos: tiempoRestante,
      tiempo_total_segundos: tiempoTotalExamen,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}