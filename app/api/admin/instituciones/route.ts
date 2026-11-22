import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET() {
  try {
    const { data: instituciones, error } = await supabase
      .from('institucion')
      .select(`
        id,
        nombre,
        dominio,
        activo,
        creado_en,
        usuario:usuario(count),
        dominio_permitido:dominio_permitido(count)
      `)
      .order('nombre');

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    interface InstitucionRow {
      id: string;
      nombre: string;
      dominio: string;
      activo: boolean;
      creado_en: string;
      usuario: { count: number }[];
      dominio_permitido: { count: number }[];
    }

    const formatted = (instituciones || []).map((inst: InstitucionRow) => ({
      id: inst.id,
      nombre: inst.nombre,
      dominio: inst.dominio,
      activo: inst.activo,
      usuarios_count: inst.usuario?.[0]?.count ?? 0,
      dominios_count: inst.dominio_permitido?.[0]?.count ?? 0,
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
    const { nombre, dominio } = body;

    if (!nombre || !dominio) {
      return NextResponse.json({ message: 'Nombre y dominio son obligatorios' }, { status: 400 });
    }

    const dominioNormalizado = dominio.trim().toLowerCase();
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(dominioNormalizado)) {
      return NextResponse.json({ message: 'Formato de dominio inválido' }, { status: 400 });
    }

    // Verificar duplicados
    const { data: existingDom } = await supabase
      .from('institucion')
      .select('id')
      .eq('dominio', dominioNormalizado)
      .maybeSingle();

    if (existingDom) {
      return NextResponse.json({ message: 'El dominio ya está registrado' }, { status: 409 });
    }

    const { data: existingNombre } = await supabase
      .from('institucion')
      .select('id')
      .eq('nombre', nombre.trim())
      .maybeSingle();

    if (existingNombre) {
      return NextResponse.json({ message: 'El nombre ya está en uso' }, { status: 409 });
    }

    const { data: institucion, error } = await supabase
      .from('institucion')
      .insert({
        nombre: nombre.trim(),
        dominio: dominioNormalizado,
        activo: true,
      })
      .select('id, nombre, dominio, activo, creado_en')
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(institucion, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}