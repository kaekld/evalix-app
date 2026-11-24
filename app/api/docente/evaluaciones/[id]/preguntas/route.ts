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

async function verifyEvaluacionOwnership(evaluacionId: string, docenteId: string) {
  const { data: evaluacion, error } = await supabase
    .from('evaluacion')
    .select('id, docente_id')
    .eq('id', evaluacionId)
    .eq('docente_id', docenteId)
    .maybeSingle();

  return { evaluacion, error };
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const body = await req.json();
    const { tipo, enunciado, imagen_url, tiempo_segundos, orden, opciones } = body;

    if (!tipo || !enunciado) {
      return NextResponse.json({ message: 'Tipo y enunciado son obligatorios' }, { status: 400 });
    }

    interface OpcionInput {
      texto: string;
      es_correcta?: boolean;
      orden?: number;
    }

    if (tipo === 'cerrada') {
      if (!opciones || !Array.isArray(opciones) || opciones.length < 2) {
        return NextResponse.json({ message: 'Las preguntas cerradas requieren al menos 2 opciones' }, { status: 400 });
      }
      const correctCount = opciones.filter((o: OpcionInput) => o.es_correcta).length;
      if (correctCount !== 1) {
        return NextResponse.json({ message: 'Debe haber exactamente una respuesta correcta' }, { status: 400 });
      }
    }

    // Get next order if not provided
    let finalOrden = orden;
    if (finalOrden === undefined || finalOrden === null) {
      const { data: lastPregunta } = await supabase
        .from('pregunta')
        .select('orden')
        .eq('evaluacion_id', id)
        .order('orden', { ascending: false })
        .limit(1)
        .maybeSingle();
      finalOrden = (lastPregunta?.orden ?? -1) + 1;
    }

    const { data: pregunta, error: pregError } = await supabase
      .from('pregunta')
      .insert({
        evaluacion_id: id,
        tipo,
        enunciado: enunciado.trim(),
        imagen_url: imagen_url?.trim() || null,
        tiempo_segundos: tiempo_segundos || 60,
        orden: finalOrden,
      })
      .select('id, tipo, enunciado, imagen_url, tiempo_segundos, orden')
      .single();

    if (pregError) {
      return NextResponse.json({ message: pregError.message }, { status: 400 });
    }

    let opcionesInsertadas = null;

    // Insert options only for closed questions
    if (tipo === 'cerrada' && opciones && opciones.length > 0) {
      const opcionesData = opciones.map((o: OpcionInput, index: number) => ({
        pregunta_id: pregunta.id,
        texto: o.texto.trim(),
        es_correcta: o.es_correcta || false,
        orden: o.orden ?? index,
      }));

      const { data, error: optError } = await supabase
        .from('opcion')
        .insert(opcionesData)
        .select('id, texto, es_correcta, orden');

      if (optError) {
        // Rollback question
        await supabase.from('pregunta').delete().eq('id', pregunta.id);
        return NextResponse.json({ message: optError.message }, { status: 400 });
      }

      opcionesInsertadas = data;
    }

    return NextResponse.json({
      ...pregunta,
      opciones: opcionesInsertadas,
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}