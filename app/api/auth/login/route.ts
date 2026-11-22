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
    const { email, password, role } = await req.json();

    const { data: user, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('correo', email)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 401 });
    }

    if (!user.activo) {
      return NextResponse.json({ message: 'La cuenta se encuentra inactiva' }, { status: 401 });
    }

    if (role && user.rol !== role.toUpperCase()) {
      return NextResponse.json({ message: `Este usuario no tiene el rol de ${role}` }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 401 });
    }

    const access_token = await new SignJWT({ sub: user.id, email: user.correo, rol: user.rol, nombre_completo: user.nombre_completo })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    const response = NextResponse.json({
      user: {
        id: user.id,
        nombre_completo: user.nombre_completo,
        correo: user.correo,
        institucion: user.institucion,
        rol: user.rol,
      },
    });

    response.cookies.set('auth_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}