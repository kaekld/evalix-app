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

export async function GET(req: Request) {
  try {
    const docenteId = await getDocenteIdFromToken(req);
    if (!docenteId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const grupoId = searchParams.get('grupo_id');
    const estado = searchParams.get('estado');

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
        actualizado_en,
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
            es_correcta,
            orden
          )
        )
      `)
      .eq('docente_id', docenteId)
      .order('creado_en', { ascending: false });

    if (grupoId) {
      query = query.eq('grupo_id', grupoId);
    }
    if (estado) {
      query = query.eq('estado', estado);
    }

    interface EvaluacionWithRelations {
      id: string;
      titulo: string;
      descripcion: string | null;
      fecha_inicio: string;
      fecha_fin: string;
      estado: string;
      tiempo_por_pregunta: number;
      orden_aleatorio: boolean;
      creado_en: string;
      actualizado_en: string;
      grupo_id: string;
      grupo: { id: string; nombre: string; codigo: string }[] | null;
      pregunta: Array<{
        id: string;
        tipo: string;
        enunciado: string;
        imagen_url: string | null;
        tiempo_segundos: number;
        orden: number;
        opcion: Array<{
          id: string;
          texto: string;
          es_correcta: boolean;
          orden: number;
        }> | null;
      }> | null;
    }

    const { data: evaluaciones, error } = await query;

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    const formatted = (evaluaciones || []).map((e: EvaluacionWithRelations) => ({
      id: e.id,
      titulo: e.titulo,
      descripcion: e.descripcion,
      fecha_inicio: e.fecha_inicio,
      fecha_fin: e.fecha_fin,
      estado: e.estado,
      tiempo_examen: e.tiempo_por_pregunta, // Map DB column to frontend field
      orden_aleatorio: e.orden_aleatorio,
      creado_en: e.creado_en,
      actualizado_en: e.actualizado_en,
      grupo_id: e.grupo_id,
      grupoNombre: e.grupo?.[0]?.nombre || '',
      grupoCodigo: e.grupo?.[0]?.codigo || '',
      preguntas: e.pregunta?.map((p) => ({
        id: p.id,
        tipo: p.tipo,
        enunciado: p.enunciado,
        imagen_url: p.imagen_url,
        tiempo_segundos: p.tiempo_segundos,
        orden: p.orden,
        opciones: p.opcion?.map((o) => ({
          id: o.id,
          texto: o.texto,
          es_correcta: o.es_correcta,
          orden: o.orden,
        })) || [],
      })) || [],
    }));

    return NextResponse.json(formatted);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const docenteId = await getDocenteIdFromToken(req);
    if (!docenteId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { titulo, grupo_id, fecha_inicio, fecha_fin, descripcion, tiempo_examen, orden_aleatorio } = body;

    if (!titulo || !grupo_id || !fecha_inicio || !fecha_fin) {
      return NextResponse.json({ message: 'Título, grupo, fecha de inicio y fecha de fin son obligatorios' }, { status: 400 });
    }

    // Verify group ownership
    const { data: grupo, error: grupoError } = await supabase
      .from('grupo')
      .select('id, docente_id, institucion_id, nombre, codigo')
      .eq('id', grupo_id)
      .eq('docente_id', docenteId)
      .maybeSingle();

    if (grupoError || !grupo) {
      return NextResponse.json({ message: 'Grupo no encontrado' }, { status: 404 });
    }

    const insertData = {
      docente_id: docenteId,
      grupo_id: grupo_id,
      institucion_id: grupo.institucion_id,
      titulo: titulo.trim(),
      descripcion: descripcion?.trim() || null,
      fecha_inicio: new Date(fecha_inicio).toISOString(),
      fecha_fin: new Date(fecha_fin).toISOString(),
      estado: 'pendiente',
      tiempo_por_pregunta: tiempo_examen || 60, // Store total exam minutes in DB column
      orden_aleatorio: orden_aleatorio || false,
    };

    const { data: evaluacion, error: evalError } = await supabase
      .from('evaluacion')
      .insert(insertData)
      .select('id, titulo, descripcion, fecha_inicio, fecha_fin, estado, tiempo_por_pregunta, orden_aleatorio, creado_en, actualizado_en, grupo_id')
      .single();

    if (evalError) {
      return NextResponse.json({ message: evalError.message }, { status: 400 });
    }

    return NextResponse.json({
      ...evaluacion,
      tiempo_examen: evaluacion.tiempo_por_pregunta, // Map DB column to frontend field
      grupoNombre: grupo.nombre,
      grupoCodigo: grupo.codigo,
      preguntas: [],
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}