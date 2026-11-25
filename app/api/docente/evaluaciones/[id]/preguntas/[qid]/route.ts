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

interface PreguntaWithEvaluacion {
  id: string;
  evaluacion_id: string;
  evaluacion: { id: string; docente_id: string }[];
  tipo?: string;
}

async function verifyPreguntaOwnership(preguntaId: string, docenteId: string) {
  const { data: pregunta, error } = await supabase
    .from('pregunta')
    .select(`
      id,
      evaluacion_id,
      evaluacion:evaluacion_id (id, docente_id)
    `)
    .eq('id', preguntaId)
    .eq('evaluacion.docente_id', docenteId)
    .maybeSingle();

  return { pregunta: pregunta as PreguntaWithEvaluacion | null, error };
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; qid: string }> }) {
  try {
    const docenteId = await getDocenteIdFromToken(req);
    if (!docenteId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { qid } = await params;
    const { pregunta, error } = await verifyPreguntaOwnership(qid, docenteId);
    if (error || !pregunta) {
      return NextResponse.json({ message: 'Pregunta no encontrada' }, { status: 404 });
    }

    const body = await req.json();
    const { tipo, enunciado, imagen_url, tiempo_segundos, orden, opciones, codigo_inicial } = body;

    interface OpcionInput {
      texto: string;
      es_correcta?: boolean;
      orden?: number;
    }

    // If tipo is being changed to cerrada, validate options
    const finalTipo = tipo || pregunta.tipo;
    if (finalTipo === 'cerrada' && opciones && Array.isArray(opciones)) {
      const correctCount = (opciones as OpcionInput[]).filter((o) => o.es_correcta).length;
      if (correctCount !== 1) {
        return NextResponse.json({ message: 'Debe haber exactamente una respuesta correcta' }, { status: 400 });
      }
    }

    const updates: Record<string, string | number | boolean | null> = {};
    if (tipo !== undefined) updates.tipo = tipo;
    if (enunciado !== undefined) updates.enunciado = enunciado.trim();
    if (imagen_url !== undefined) updates.imagen_url = imagen_url?.trim() || null;
    if (tiempo_segundos !== undefined) updates.tiempo_segundos = tiempo_segundos;
    if (orden !== undefined) updates.orden = orden;
    if (codigo_inicial !== undefined) updates.codigo_inicial = finalTipo === 'abierta' && codigo_inicial ? codigo_inicial.trim() : null;

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('pregunta')
        .update(updates)
        .eq('id', qid);

      if (updateError) {
        return NextResponse.json({ message: updateError.message }, { status: 400 });
      }
    }

    // Update options if provided
    if (opciones && Array.isArray(opciones)) {
      // Delete existing options
      const { error: delError } = await supabase
        .from('opcion')
        .delete()
        .eq('pregunta_id', qid);

      if (delError) {
        return NextResponse.json({ message: delError.message }, { status: 400 });
      }

      // Insert new options
      const opcionesData = (opciones as OpcionInput[]).map((o, index) => ({
        pregunta_id: qid,
        texto: o.texto.trim(),
        es_correcta: o.es_correcta || false,
        orden: o.orden ?? index,
      }));

      const { error: optError } = await supabase
        .from('opcion')
        .insert(opcionesData);

      if (optError) {
        return NextResponse.json({ message: optError.message }, { status: 400 });
      }
    }

    // Fetch updated question with options
    const { data: preguntaActualizada, error: fetchError } = await supabase
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
      .eq('id', qid)
      .single();

    if (fetchError) {
      return NextResponse.json({ message: fetchError.message }, { status: 400 });
    }

    return NextResponse.json(preguntaActualizada);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; qid: string }> }) {
  try {
    const docenteId = await getDocenteIdFromToken(req);
    if (!docenteId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { qid } = await params;
    const { pregunta, error } = await verifyPreguntaOwnership(qid, docenteId);
    if (error || !pregunta) {
      return NextResponse.json({ message: 'Pregunta no encontrada' }, { status: 404 });
    }

    const { error: deleteError } = await supabase.from('pregunta').delete().eq('id', qid);

    if (deleteError) {
      return NextResponse.json({ message: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Pregunta eliminada correctamente' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}