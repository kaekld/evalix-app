import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'evalix_secret_key_2026');

interface GrupoRow {
  id: string;
  nombre: string;
  codigo: string;
  categoria: string;
  descripcion: string | null;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
  institucion_id: string;
  docente_id: string;
}

interface GrupoEstudianteRow {
  grupo_id: string;
  inscrito_en: string;
  grupo: GrupoRow | GrupoRow[] | null;
}

interface EvaluacionRow {
  id: string;
  grupo_id: string;
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'programada' | 'publicada' | 'en_curso' | 'finalizada' | 'cancelada';
  tiempo_examen: number;
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

export async function GET(req: Request) {
  try {
    const alumnoId = await getAlumnoIdFromToken(req);
    if (!alumnoId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { data: grupoEstudiante, error: geError } = await supabase
      .from('grupo_estudiante')
      .select(`
        grupo_id,
        inscrito_en,
        grupo:grupo_id (
          id,
          nombre,
          codigo,
          categoria,
          descripcion,
          activo,
          creado_en,
          actualizado_en,
          institucion_id,
          docente_id
        )
      `)
      .eq('alumno_id', alumnoId)
      .eq('activo', true);

    if (geError) {
      return NextResponse.json({ message: geError.message }, { status: 400 });
    }

    if (!grupoEstudiante || grupoEstudiante.length === 0) {
      return NextResponse.json([]);
    }

    const grupoIds = grupoEstudiante.map((ge) => ge.grupo_id);

    const { data: evaluaciones, error: evalError } = await supabase
      .from('evaluacion')
      .select('id, grupo_id, titulo, fecha_inicio, fecha_fin, estado, tiempo_examen')
      .in('grupo_id', grupoIds)
      .in('estado', ['publicada', 'programada', 'en_curso', 'finalizada'])
      .order('fecha_inicio', { ascending: true });

    if (evalError) {
      return NextResponse.json({ message: evalError.message }, { status: 400 });
    }

    const evaluacionesByGrupo = new Map<string, EvaluacionRow[]>();
    (evaluaciones as EvaluacionRow[] || []).forEach((e) => {
      const arr = evaluacionesByGrupo.get(e.grupo_id) || [];
      arr.push(e);
      evaluacionesByGrupo.set(e.grupo_id, arr);
    });

    const formatted = (grupoEstudiante as GrupoEstudianteRow[])
      .filter((ge) => {
        const grupo = Array.isArray(ge.grupo) ? ge.grupo[0] : ge.grupo;
        return grupo && grupo.activo;
      })
      .map((ge) => {
        const grupo = Array.isArray(ge.grupo) ? ge.grupo[0] : ge.grupo!;
        const examenes = (evaluacionesByGrupo.get(grupo.id) || []).map((e) => ({
          id: e.id,
          titulo: e.titulo,
          fecha_inicio: e.fecha_inicio,
          fecha_fin: e.fecha_fin,
          estado: e.estado,
          tiempo_examen: e.tiempo_examen,
        }));

        return {
          id: grupo.id,
          nombre: grupo.nombre,
          codigo: grupo.codigo,
          categoria: grupo.categoria,
          descripcion: grupo.descripcion,
          inscrito_en: ge.inscrito_en,
          examenes,
        };
      });

    return NextResponse.json(formatted);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}