import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const TIPOS_VALIDOS = ['todos', 'alumno', 'docente', 'administrador'] as const;

export async function GET() {
  try {
    // Fetch dominios and join with institucion manually since nested select is tricky
    const { data: dominios, error } = await supabase
      .from('dominio_permitido')
      .select(`
        id,
        dominio,
        tipo,
        activo,
        institucion_id
      `)
      .order('dominio');

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    interface DominioRow {
      id: string;
      dominio: string;
      tipo: string;
      activo: boolean;
      institucion_id: string;
    }

    // Fetch institution names separately
    const institucionIds = [...new Set((dominios || []).map((d: DominioRow) => d.institucion_id))];
    const { data: instituciones } = await supabase
      .from('institucion')
      .select('id, nombre')
      .in('id', institucionIds);

    interface InstitucionRow {
      id: string;
      nombre: string;
    }

    const institucionMap = new Map((instituciones || []).map((i: InstitucionRow) => [i.id, i.nombre]));

    const formatted = (dominios || []).map((dom: DominioRow) => ({
      id: dom.id,
      dominio: dom.dominio,
      tipo: dom.tipo,
      activo: dom.activo,
      institucion_id: dom.institucion_id,
      institucion_nombre: institucionMap.get(dom.institucion_id) || 'Desconocida',
    }));

    return NextResponse.json(formatted);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dominio, tipo, institucion_id } = body;

    if (!dominio || !tipo || !institucion_id) {
      return NextResponse.json({ message: 'Dominio, tipo e institución son obligatorios' }, { status: 400 });
    }

    if (!TIPOS_VALIDOS.includes(tipo as typeof TIPOS_VALIDOS[number])) {
      return NextResponse.json({ message: 'Tipo inválido' }, { status: 400 });
    }

    const dominioNormalizado = dominio.trim().toLowerCase();
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(dominioNormalizado)) {
      return NextResponse.json({ message: 'Formato de dominio inválido' }, { status: 400 });
    }

    // Verificar que la institución existe
    const { data: institucion, error: instError } = await supabase
      .from('institucion')
      .select('id')
      .eq('id', institucion_id)
      .maybeSingle();

    if (instError || !institucion) {
      return NextResponse.json({ message: 'Institución no encontrada' }, { status: 404 });
    }

    // Verificar duplicado (dominio único global)
    const { data: existingDom } = await supabase
      .from('dominio_permitido')
      .select('id')
      .eq('dominio', dominioNormalizado)
      .maybeSingle();

    if (existingDom) {
      return NextResponse.json({ message: 'El dominio ya está registrado' }, { status: 409 });
    }

    const { data: dominioCreado, error } = await supabase
      .from('dominio_permitido')
      .insert({
        dominio: dominioNormalizado,
        tipo,
        institucion_id,
        activo: true,
      })
      .select('id, dominio, tipo, activo, institucion_id, created_at')
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(dominioCreado, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}