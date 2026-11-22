import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'evalix_secret_key_2026');

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const authCookie = cookieHeader
    .split('; ')
    .find((c) => c.startsWith('admin_token='));
  const token = authCookie ? authCookie.slice('admin_token='.length) : null;

  if (!token) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.sub as string;

    const { data: user, error } = await supabase
      .from('usuario')
      .select('id, nombre_completo, correo, activo, rol, institucion_id, institucion:institucion_id(nombre)')
      .eq('id', userId)
      .maybeSingle();

    if (error || !user || !user.activo || user.rol !== 'ADMINISTRADOR') {
      const response = NextResponse.json({ message: 'Sesión no válida' }, { status: 401 });
      response.cookies.delete('admin_token');
      return response;
    }

    // Verificar que existe en la tabla administrador
    const { data: adminProfile } = await supabase
      .from('administrador')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!adminProfile) {
      const response = NextResponse.json({ message: 'Perfil de administrador no encontrado' }, { status: 401 });
      response.cookies.delete('admin_token');
      return response;
    }

    const institucionRelacion = user.institucion as
      | { nombre: string }
      | { nombre: string }[]
      | null;
    const institucion = Array.isArray(institucionRelacion)
      ? institucionRelacion[0]?.nombre ?? null
      : institucionRelacion?.nombre ?? null;

    return NextResponse.json({
      id: user.id,
      email: user.correo,
      rol: user.rol,
      nombre_completo: user.nombre_completo,
      institucion,
      institucion_id: user.institucion_id,
    });
  } catch {
    const response = NextResponse.json({ message: 'Token inválido o expirado' }, { status: 401 });
    response.cookies.delete('admin_token');
    return response;
  }
}