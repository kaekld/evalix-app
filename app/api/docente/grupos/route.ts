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
  materia: string;
  descripcion: string | null;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
  institucion_id: string;
  grupo_estudiante?: Array<{ count: number }>;
}

interface DocenteUsuarioRow {
  usuario: Array<{ institucion_id: string }> | { institucion_id: string } | null;
}



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

    // Get docente_id from usuario.id (which equals docente.id)
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
    const activo = searchParams.get('activo');

    let query = supabase
      .from('grupo')
      .select(`
        id,
        nombre,
        codigo,
        materia,
        descripcion,
        activo,
        creado_en,
        actualizado_en,
        institucion_id,
        grupo_estudiante:grupo_estudiante(count)
      `)
      .eq('docente_id', docenteId)
      .order('creado_en', { ascending: false });

    if (activo !== null) {
      query = query.eq('activo', activo === 'true');
    }

    const { data: grupos, error } = await query;

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    const formatted = (grupos || []).map((g: GrupoRow) => ({
      id: g.id,
      nombre: g.nombre,
      codigo: g.codigo,
      materia: g.materia,
      descripcion: g.descripcion,
      activo: g.activo,
      creado_en: g.creado_en,
      actualizado_en: g.actualizado_en,
      institucion_id: g.institucion_id,
      estudiantes_count: g.grupo_estudiante?.[0]?.count ?? 0,
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
    const { nombre, codigo, materia, descripcion } = body;

    if (!nombre || !codigo || !materia) {
      return NextResponse.json({ message: 'Nombre, código y materia son obligatorios' }, { status: 400 });
    }

    // Get docente's institution
    const { data: docente, error: docenteError } = await supabase
      .from('docente')
      .select('id, usuario!inner(institucion_id)')
      .eq('id', docenteId)
      .maybeSingle();

    if (docenteError || !docente) {
      return NextResponse.json({ message: 'Docente no encontrado' }, { status: 404 });
    }

    const docenteData = docente as DocenteUsuarioRow;
    const institucionId = docenteData.usuario
      ? Array.isArray(docenteData.usuario)
        ? docenteData.usuario[0]?.institucion_id
        : docenteData.usuario.institucion_id
      : null;
    if (!institucionId) {
      return NextResponse.json({ message: 'Docente sin institución asignada' }, { status: 400 });
    }

    // Check if code already exists for this docente
    const { data: existing } = await supabase
      .from('grupo')
      .select('id')
      .eq('docente_id', docenteId)
      .eq('codigo', codigo.trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ message: 'Ya existe un grupo con ese código' }, { status: 409 });
    }

    const { data: grupo, error } = await supabase
      .from('grupo')
      .insert({
        docente_id: docenteId,
        institucion_id: institucionId,
        nombre: nombre.trim(),
        codigo: codigo.trim().toUpperCase(),
        materia: materia.trim(),
        descripcion: descripcion?.trim() || null,
        activo: true,
      })
      .select('id, nombre, codigo, materia, descripcion, activo, creado_en, actualizado_en, institucion_id')
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({
      ...grupo,
      estudiantes_count: 0,
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}