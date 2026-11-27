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
    return payload.sub as string;
  } catch {
    return null;
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const alumnoId = await getAlumnoIdFromToken(req);
  if (!alumnoId) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }

  const { id: grupoId } = await params;

  // Verificar que el alumno pertenece al grupo
  const { data: membership, error: membershipError } = await supabase
    .from('grupo_estudiante')
    .select('id')
    .eq('grupo_id', grupoId)
    .eq('alumno_id', alumnoId)
    .eq('activo', true)
    .single();

  if (membershipError || !membership) {
    return NextResponse.json({ message: 'No tienes acceso a este grupo' }, { status: 403 });
  }

  // 1. Grupo (query simple)
  const { data: grupo, error: grupoError } = await supabase
    .from('grupo')
    .select(`
      id,
      nombre,
      codigo,
      categoria,
      descripcion,
      creado_en,
      docente_id
    `)
    .eq('id', grupoId)
    .single();

  if (grupoError || !grupo) {
    return NextResponse.json({ message: 'Grupo no encontrado' }, { status: 404 });
  }

  // Get docente info separately
  let docente = null;
  if (grupo.docente_id) {
    const { data: docenteData, error: docenteError } = await supabase
      .from('usuario')
      .select('id, nombre_completo, correo')
      .eq('id', grupo.docente_id)
      .single();
    
    if (!docenteError && docenteData) {
      docente = docenteData;
    }
  }

  // 2. Evaluaciones del grupo (TODAS, sin filtrar por alumno)
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
      orden_aleatorio
    `)
    .eq('grupo_id', grupoId)
    .order('fecha_inicio', { ascending: false });

  if (evalError) {
    console.error('Error fetching evaluaciones:', evalError);
    return NextResponse.json({ message: 'Error al cargar evaluaciones' }, { status: 500 });
  }

  // 3. Obtener intentos del alumno para estas evaluaciones
  const evaluacionIds = (evaluaciones || []).map(e => e.id);
  let intentosMap: Record<string, any> = {};
  
  if (evaluacionIds.length > 0) {
    const { data: intentos, error: intentosError } = await supabase
      .from('examen_intento')
      .select('id, evaluacion_id, estado, iniciado_en, finalizado_en, alumno_id')
      .in('evaluacion_id', evaluacionIds)
      .eq('alumno_id', alumnoId);
    
    if (!intentosError && intentos) {
      intentosMap = intentos.reduce((acc, intento) => {
        acc[intento.evaluacion_id] = intento;
        return acc;
      }, {} as Record<string, any>);
    }
  }

  // 4. Alumnos inscritos
  const { data: alumnos, error: alumnosError } = await supabase
    .from('grupo_estudiante')
    .select(`
      inscrito_en,
      alumno:usuario!alumno_id (
        id,
        nombre_completo,
        correo
      )
    `)
    .eq('grupo_id', grupoId)
    .eq('activo', true)
    .order('inscrito_en', { ascending: true });

  if (alumnosError) {
    console.error('Error fetching alumnos:', alumnosError);
  }

  // Procesar evaluaciones
  const now = new Date();
  const evaluacionesProcesadas = (evaluaciones || []).map((e) => {
    const inicio = new Date(e.fecha_inicio);
    const fin = new Date(e.fecha_fin);
    const intento = intentosMap[e.id];
    let mi_estado: 'pending' | 'completed' | 'in_progress' | 'not_started' = 'not_started';

    if (intento) {
      switch (intento.estado) {
        case 'completado':
          mi_estado = 'completed';
          break;
        case 'en_curso':
        case 'incidencia':
          mi_estado = 'in_progress';
          break;
        case 'cancelado':
          mi_estado = 'not_started';
          break;
      }
    } else {
      if (now >= inicio && now <= fin && (e.estado === 'publicada' || e.estado === 'programada' || e.estado === 'en_curso')) {
        mi_estado = 'pending';
      } else if (now < inicio) {
        mi_estado = 'not_started';
      } else {
        mi_estado = 'not_started';
      }
    }

    return {
      id: e.id,
      titulo: e.titulo,
      descripcion: e.descripcion,
      fecha_inicio: e.fecha_inicio,
      fecha_fin: e.fecha_fin,
      estado: e.estado,
      tiempo_examen: e.tiempo_examen,
      orden_aleatorio: e.orden_aleatorio,
      mi_estado,
    };
  });

  const proximas = evaluacionesProcesadas.filter(e => 
    ['programada', 'publicada'].includes(e.estado) && new Date(e.fecha_inicio) > now
  );
  const en_curso = evaluacionesProcesadas.filter(e => e.estado === 'en_curso');
  const completadas = evaluacionesProcesadas.filter(e => 
    e.estado === 'finalizada' || e.mi_estado === 'completed'
  );
  const canceladas = evaluacionesProcesadas.filter(e => e.estado === 'cancelada');

  const alumnosProcesados = (alumnos || []).map((a) => {
    const alumno = Array.isArray(a.alumno) ? a.alumno[0] : a.alumno;
    return {
      id: alumno?.id || '',
      nombre_completo: alumno?.nombre_completo || 'Sin nombre',
      correo: alumno?.correo || '',
      inscrito_en: a.inscrito_en,
    };
  });

  return NextResponse.json({
    grupo: {
      id: grupo.id,
      nombre: grupo.nombre,
      codigo: grupo.codigo,
      categoria: grupo.categoria,
      descripcion: grupo.descripcion,
      creado_en: grupo.creado_en,
      docente: docente ? {
        id: docente.id,
        nombre_completo: docente.nombre_completo,
        correo: docente.correo,
      } : null,
    },
    evaluaciones: {
      proximas,
      en_curso,
      completadas,
      canceladas,
    },
    alumnos: alumnosProcesados,
    estadisticas: {
      total_evaluaciones: evaluacionesProcesadas.length,
      total_alumnos: alumnosProcesados.length,
      evaluaciones_proximas: proximas.length,
      evaluaciones_completadas: completadas.length,
    },
  });
}
