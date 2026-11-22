import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'evalix_secret_key_2026');

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const token = cookieHeader
    .split('; ')
    .find((c) => c.startsWith('auth_token='))
    ?.split('=')[1];

  if (!token) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    return NextResponse.json({
      id: payload.sub,
      email: payload.email,
      rol: payload.rol,
      nombre_completo: payload.nombre_completo,
    });
  } catch {
    return NextResponse.json({ message: 'Token inválido o expirado' }, { status: 401 });
  }
}