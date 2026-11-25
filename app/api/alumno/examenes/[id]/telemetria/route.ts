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

// Mapear severidad por tipo de evento
const severidadPorTipo: Record<string, 'baja' | 'media' | 'alta'> = {
  focus_lost: 'media',
  paste: 'alta',
  typing_anomaly: 'media',
  fullscreen_exit: 'alta',
  connection_lost: 'alta',
  tab_switch: 'media',
  copy_attempt: 'alta',
  right_click: 'baja',
  devtools_open: 'alta',
  screenshot_attempt: 'media',
  network_error: 'media',
};

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
    const body = await req.json();
    const { eventos } = body; // Array de eventos de telemetría

    if (!Array.isArray(eventos) || eventos.length === 0) {
      return NextResponse.json({ message: 'eventos array requerido' }, { status: 400 });
    }

    // Verificar que el intento existe y pertenece al alumno
    const { data: intento, error: intentoError } = await supabase
      .from('examen_intento')
      .select('id, estado')
      .eq('evaluacion_id', evaluacionId)
      .eq('alumno_id', alumnoId)
      .maybeSingle();

    if (intentoError || !intento) {
      return NextResponse.json({ message: 'Intento no encontrado' }, { status: 404 });
    }

    if (intento.estado === 'completado' || intento.estado === 'cancelado') {
      return NextResponse.json({ ok: true }); // Silenciosamente ignorar
    }

    // Insertar incidentes en lote
    const incidentes = eventos
      .filter((e: any) => e && e.type)
      .map((e: any) => ({
        intento_id: intento.id,
        tipo: e.type,
        severidad: severidadPorTipo[e.type] || 'media',
        detalle: {
          timestamp: e.timestamp || new Date().toISOString(),
          pregunta_id: e.pregunta_id,
          ...e.data,
        },
      }));

    if (incidentes.length > 0) {
      const { error: insertError } = await supabase
        .from('examen_incidente')
        .insert(incidentes);

      if (insertError) {
        console.error('Error insertando incidentes:', insertError);
        // No fallar la request, solo log
      }

      // Si hay eventos críticos, marcar intento como incidencia
      const tiposCriticos = ['paste', 'fullscreen_exit', 'connection_lost', 'copy_attempt', 'devtools_open'];
      const tieneCritico = incidentes.some(i => tiposCriticos.includes(i.tipo));
      if (tieneCritico && intento.estado === 'en_curso') {
        await supabase
          .from('examen_intento')
          .update({ estado: 'incidencia' })
          .eq('id', intento.id);
      }
    }

    return NextResponse.json({ ok: true, recibidos: incidentes.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}