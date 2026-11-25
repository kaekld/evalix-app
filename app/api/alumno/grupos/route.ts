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

    const { searchParams } = new URL(req.url);
    const activo = searchParams.get('activo');

    const { data: grupoEstudiante, error: geError } = await supabase
      .from('grupo_estudiante')
      .select(`
        grupo_id,
        inscrito_en,
        activo,
        grupo:grupo_id (
          id,
          nombre,
          codigo,
          categoria,
          descripcion,
          activo,
          creado_en,
          actualizado_en,
          institucion_id
        )
      `)
      .eq('alumno_id', alumnoId)
      .eq('activo', true)
      .order('inscrito_en', { ascending: false });

    if (geError) {
      return NextResponse.json({ message: geError.message }, { status: 400 });
    }

    const formatted = (grupoEstudiante || []).map((ge: any) => {
      const grupo = Array.isArray(ge.grupo) ? ge.grupo[0] : ge.grupo;
      return {
        id: grupo?.id,
        nombre: grupo?.nombre,
        codigo: grupo?.codigo,
        categoria: grupo?.categoria,
        descripcion: grupo?.descripcion,
        activo: grupo?.activo,
        creado_en: grupo?.creado_en,
        actualizado_en: grupo?.actualizado_en,
        institucion_id: grupo?.institucion_id,
        inscrito_en: ge.inscrito_en,
      };
    });

    return NextResponse.json(formatted);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}
