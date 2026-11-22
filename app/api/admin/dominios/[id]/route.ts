import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const TIPOS_VALIDOS = ['todos', 'alumno', 'docente', 'administrador'] as const;

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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

    // Verificar que el dominio existe
    const { data: existing, error: findError } = await supabase
      .from('dominio_permitido')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (findError || !existing) {
      return NextResponse.json({ message: 'Dominio no encontrado' }, { status: 404 });
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

    // Verificar duplicado excluyendo el actual
    const { data: existingDom } = await supabase
      .from('dominio_permitido')
      .select('id')
      .eq('dominio', dominioNormalizado)
      .neq('id', id)
      .maybeSingle();

    if (existingDom) {
      return NextResponse.json({ message: 'El dominio ya está registrado en otro registro' }, { status: 409 });
    }

    const { data: dominioActualizado, error } = await supabase
      .from('dominio_permitido')
      .update({
        dominio: dominioNormalizado,
        tipo,
        institucion_id,
      })
      .eq('id', id)
      .select('id, dominio, tipo, activo, institucion_id, created_at')
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(dominioActualizado);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { error } = await supabase.from('dominio_permitido').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Dominio eliminado correctamente' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}