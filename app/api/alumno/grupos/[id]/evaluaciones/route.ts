import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'evalix_secret_key_2026');

interface ExamenIntentoRow {
  id: string;
  estado: 'en_curso' | 'completado' | 'incidencia' | 'cancelado';
  iniciado_en: string;
  finalizado_en: string | null;
  alumno_id: string;
}

interface EvaluacionRow {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'programada' | 'publicada' | 'en_curso' | 'finalizada' | 'cancelada';
  tiempo_examen: number;
  orden_aleatorio: boolean;
  examen_intento: ExamenIntentoRow | ExamenIntentoRow[] | null;
}

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

    const { id: grupoId } = await params;

    const { data: membership, error: memError } = await supabase
      .from('grupo_estudiante')
      .select('id')
      .eq('grupo_id', grupoId)
      .eq('alumno_id', alumnoId)
      .eq('activo', true)
      .maybeSingle();

    if (memError || !membership) {
      return NextResponse.json({ message: 'No estás inscrito en este grupo' }, { status: 403 });
    }

    const { data: evaluaciones, error: evalError } = await supabase
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
        examen_intento:examen_intento!inner (
          id,
          estado,
          iniciado_en,
          finalizado_en,
          alumno_id
        )
      `)
      .eq('grupo_id', grupoId)
      .in('estado', ['publicada', 'programada', 'en_curso', 'finalizada', 'cancelada'])
      .eq('examen_intento.alumno_id', alumnoId)
      .order('fecha_inicio', { ascending: false });

    if (evalError) {
      return NextResponse.json({ message: evalError.message }, { status: 400 });
    }

    const formatted = (evaluaciones as EvaluacionRow[] || []).map((e) => {
      const intento = Array.isArray(e.examen_intento) ? e.examen_intento[0] : e.examen_intento;
      let status: 'pending' | 'completed' | 'cancelled' = 'pending';
      
      if (e.estado === 'cancelada') {
        status = 'cancelled';
      } else if (intento?.estado === 'completado') {
        status = 'completed';
      } else if (intento?.estado === 'en_curso' || intento?.estado === 'incidencia') {
        status = 'pending';
      }

      return {
        id: e.id,
        unit: e.titulo,
        date: new Date(e.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).toUpperCase(),
        time: new Date(e.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        status,
        evaluacion: {
          id: e.id,
          titulo: e.titulo,
          descripcion: e.descripcion,
          fecha_inicio: e.fecha_inicio,
          fecha_fin: e.fecha_fin,
          estado: e.estado,
          tiempo_examen: e.tiempo_examen,
          orden_aleatorio: e.orden_aleatorio,
        },
        intento: intento ? {
          id: intento.id,
          estado: intento.estado,
          iniciado_en: intento.iniciado_en,
          finalizado_en: intento.finalizado_en,
        } : null,
      };
    });

    return NextResponse.json(formatted);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}