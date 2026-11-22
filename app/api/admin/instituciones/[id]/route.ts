import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nombre, dominio } = body;

    if (!nombre || !dominio) {
      return NextResponse.json({ message: 'Nombre y dominio son obligatorios' }, { status: 400 });
    }

    const dominioNormalizado = dominio.trim().toLowerCase();
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(dominioNormalizado)) {
      return NextResponse.json({ message: 'Formato de dominio inválido' }, { status: 400 });
    }

    // Verificar que la institución existe
    const { data: existing, error: findError } = await supabase
      .from('institucion')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (findError || !existing) {
      return NextResponse.json({ message: 'Institución no encontrada' }, { status: 404 });
    }

    // Verificar duplicados excluyendo la actual
    const { data: existingDom } = await supabase
      .from('institucion')
      .select('id')
      .eq('dominio', dominioNormalizado)
      .neq('id', id)
      .maybeSingle();

    if (existingDom) {
      return NextResponse.json({ message: 'El dominio ya está registrado en otra institución' }, { status: 409 });
    }

    const { data: existingNombre } = await supabase
      .from('institucion')
      .select('id')
      .eq('nombre', nombre.trim())
      .neq('id', id)
      .maybeSingle();

    if (existingNombre) {
      return NextResponse.json({ message: 'El nombre ya está en uso en otra institución' }, { status: 409 });
    }

    const { data: institucion, error } = await supabase
      .from('institucion')
      .update({
        nombre: nombre.trim(),
        dominio: dominioNormalizado,
      })
      .eq('id', id)
      .select('id, nombre, dominio, activo, created_at')
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(institucion);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Verificar que la institución existe
    const { data: existing, error: findError } = await supabase
      .from('institucion')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (findError || !existing) {
      return NextResponse.json({ message: 'Institución no encontrada' }, { status: 404 });
    }

    // Verificar si tiene usuarios asociados
    const { count: usuariosCount } = await supabase
      .from('usuario')
      .select('*', { count: 'exact', head: true })
      .eq('institucion_id', id);

    if (usuariosCount && usuariosCount > 0) {
      return NextResponse.json(
        { message: `No se puede eliminar: la institución tiene ${usuariosCount} usuario(s) asociado(s)` },
        { status: 400 },
      );
    }

    // Los dominios permitidos se eliminan en cascada por la FK
    const { error } = await supabase.from('institucion').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Institución eliminada correctamente' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}