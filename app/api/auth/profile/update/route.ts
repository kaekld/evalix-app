import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'evalix_secret_key_2026');

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Token no proporcionado' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.sub as string;

    const body = await req.json();
    const { nombre_completo } = body;

    if (!nombre_completo || !nombre_completo.trim()) {
      return NextResponse.json({ message: 'Nombre completo es requerido' }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from('usuario')
      .update({ nombre_completo: nombre_completo.trim() })
      .eq('id', userId)
      .select('id, nombre_completo, correo, institucion_id, activo, rol')
      .single();

    if (error || !user) {
      return NextResponse.json({ message: error?.message || 'Error al actualizar perfil' }, { status: 400 });
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Error interno' }, { status: 500 });
  }
}