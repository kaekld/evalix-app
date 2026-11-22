import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';
import { createClient } from '@supabase/supabase-js';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'evalix_secret_key_2026');

function extraerToken(req: Request): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length);
  }

  const cookieHeader = req.headers.get('cookie') || '';
  const authCookie = cookieHeader
    .split('; ')
    .find((c) => c.startsWith('auth_token='));

  return authCookie ? authCookie.slice('auth_token='.length) : null;
}

export async function PUT(req: Request) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  try {
    const token = extraerToken(req);
    if (!token) {
      return NextResponse.json({ message: 'Token no proporcionado' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const userId = payload.sub as string;

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Faltan campos obligatorios' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: 'La nueva contraseña debe tener al menos 8 caracteres' }, { status: 400 });
    }

    // Obtener usuario actual con password_hash
    const { data: user, error: userError } = await supabase
      .from('usuario')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ message: 'La contraseña actual es incorrecta' }, { status: 401 });
    }

    // Hashear nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    const { error: updateError } = await supabase
      .from('usuario')
      .update({ password_hash: newPasswordHash })
      .eq('id', userId);

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Contraseña cambiada correctamente' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}