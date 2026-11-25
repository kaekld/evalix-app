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

interface EvaluacionWithGrupo {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  tiempo_examen: number;
  orden_aleatorio: boolean;
  creado_en: string;
  actualizado_en: string;
  grupo_id: string;
  grupo: { id: string; nombre: string; codigo: string }[];
}

async function verifyEvaluacionOwnership(evaluacionId: string, docenteId: string) {
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
      orden_aleatorio,
      creado_en,
      actualizado_en,
      grupo_id,
      grupo:grupo_id (id, nombre, codigo)
    `)
    .eq('id', evaluacionId)
    .eq('docente_id', docenteId)
    .maybeSingle();

  return { evaluacion: evaluacion as EvaluacionWithGrupo | null, error };
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const docenteId = await getDocenteIdFromToken(req);
    if (!docenteId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const { evaluacion, error } = await verifyEvaluacionOwnership(id, docenteId);

    if (error || !evaluacion) {
      return NextResponse.json({ message: 'Evaluación no encontrada' }, { status: 404 });
    }

    // Fetch questions with options
    const { data: preguntas, error: pregError } = await supabase
      .from('pregunta')
      .select(`
        id,
        tipo,
        enunciado,
        imagen_url,
        tiempo_segundos,
        orden,
        codigo_inicial,
        opcion:opcion (
          id,
          texto,
          es_correcta,
          orden
        )
      `)
      .eq('evaluacion_id', id)
      .order('orden', { ascending: true });

    if (pregError) {
      return NextResponse.json({ message: pregError.message }, { status: 400 });
    }

    interface PreguntaWithOpciones {
      id: string;
      tipo: string;
      enunciado: string;
      imagen_url: string | null;
      tiempo_segundos: number;
      orden: number;
      codigo_inicial: string | null;
      opcion: Array<{
        id: string;
        texto: string;
        es_correcta: boolean;
        orden: number;
      }> | null;
    }

    const formatted = {
      ...evaluacion,
      tiempo_examen: evaluacion.tiempo_examen,
      grupoNombre: evaluacion.grupo?.[0]?.nombre || '',
      grupoCodigo: evaluacion.grupo?.[0]?.codigo || '',
      preguntas: (preguntas || []).map((p: PreguntaWithOpciones) => ({
        id: p.id,
        tipo: p.tipo,
        enunciado: p.enunciado,
        imagen_url: p.imagen_url,
        tiempo_segundos: p.tiempo_segundos,
        orden: p.orden,
        codigo_inicial: p.codigo_inicial,
        opciones: p.opcion?.map((o) => ({
          id: o.id,
          texto: o.texto,
          es_correcta: o.es_correcta,
          orden: o.orden,
        })) || [],
      })),
    };

    return NextResponse.json(formatted);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const docenteId = await getDocenteIdFromToken(req);
    if (!docenteId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { titulo, grupo_id, fecha_inicio, fecha_fin, descripcion, estado, tiempo_examen, orden_aleatorio } = body;

    const { evaluacion, error } = await verifyEvaluacionOwnership(id, docenteId);
    if (error || !evaluacion) {
      return NextResponse.json({ message: 'Evaluación no encontrada' }, { status: 404 });
    }

    // If changing grupo_id, verify ownership
    if (grupo_id && grupo_id !== evaluacion.grupo_id) {
      const { data: grupo, error: grupoError } = await supabase
        .from('grupo')
        .select('id, docente_id')
        .eq('id', grupo_id)
        .eq('docente_id', docenteId)
        .maybeSingle();

      if (grupoError || !grupo) {
        return NextResponse.json({ message: 'Grupo no encontrado' }, { status: 404 });
      }
    }

    const updates: Record<string, string | number | boolean | null> = {};
    if (titulo !== undefined) updates.titulo = titulo.trim();
    if (grupo_id !== undefined) updates.grupo_id = grupo_id;
    if (fecha_inicio !== undefined) updates.fecha_inicio = new Date(fecha_inicio).toISOString();
    if (fecha_fin !== undefined) updates.fecha_fin = new Date(fecha_fin).toISOString();
    if (descripcion !== undefined) updates.descripcion = descripcion?.trim() || null;
    if (estado !== undefined) updates.estado = estado;
    if (tiempo_examen !== undefined) updates.tiempo_examen = tiempo_examen;
    if (orden_aleatorio !== undefined) updates.orden_aleatorio = orden_aleatorio;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: 'No hay campos para actualizar' }, { status: 400 });
    }

    const { data: evaluacionActualizada, error: updateError } = await supabase
      .from('evaluacion')
      .update(updates)
      .eq('id', id)
      .select('id, titulo, descripcion, fecha_inicio, fecha_fin, estado, tiempo_examen, orden_aleatorio, creado_en, actualizado_en, grupo_id')
      .single();

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 400 });
    }

    return NextResponse.json(evaluacionActualizada);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const docenteId = await getDocenteIdFromToken(req);
    if (!docenteId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const { evaluacion, error } = await verifyEvaluacionOwnership(id, docenteId);
    if (error || !evaluacion) {
      return NextResponse.json({ message: 'Evaluación no encontrada' }, { status: 404 });
    }

    const { error: deleteError } = await supabase.from('evaluacion').delete().eq('id', id);

    if (deleteError) {
      return NextResponse.json({ message: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Evaluación eliminada correctamente' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}