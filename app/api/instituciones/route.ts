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
      .select('id, nombre, dominio')
      .eq('activo', true)
      .order('nombre');

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(instituciones);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Error interno' }, { status: 500 });
  }
}