import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'evalix_secret_key_2026');

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Correo y contraseña son obligatorios' }, { status: 400 });
    }

    const correoNormalizado = String(email).trim().toLowerCase();

    const { data: user, error } = await supabase
      .from('usuario')
      .select('id, nombre_completo, correo, password_hash, activo, rol, institucion_id, institucion:institucion_id(nombre)')
      .eq('correo', correoNormalizado)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 401 });
    }

    if (user.rol !== 'ADMINISTRADOR') {
      return NextResponse.json({ message: 'Acceso denegado: solo administradores' }, { status: 403 });
    }

    if (!user.activo) {
      return NextResponse.json({ message: 'La cuenta se encuentra inactiva' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 401 });
    }

    // Verificar que existe en la tabla administrador
    const { data: adminProfile } = await supabase
      .from('administrador')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!adminProfile) {
      return NextResponse.json({ message: 'Perfil de administrador no encontrado' }, { status: 403 });
    }

    const institucionRelacion = user.institucion as
      | { nombre: string }
      | { nombre: string }[]
      | null;
    const institucion = Array.isArray(institucionRelacion)
      ? institucionRelacion[0]?.nombre ?? null
      : institucionRelacion?.nombre ?? null;

    const access_token = await new SignJWT({
      sub: user.id,
      email: user.correo,
      rol: user.rol,
      nombre_completo: user.nombre_completo,
      institucion,
      institucion_id: user.institucion_id,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('8h')
      .sign(secret);

    const response = NextResponse.json({
      user: {
        id: user.id,
        nombre_completo: user.nombre_completo,
        correo: user.correo,
        institucion,
        institucion_id: user.institucion_id,
        rol: user.rol,
      },
    });

    response.cookies.set('admin_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}