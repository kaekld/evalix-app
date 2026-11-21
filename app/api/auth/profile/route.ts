import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'evalix_secret_key_2026');

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Token no proporcionado' }, { status: 401 });
    }

    try {
    const token = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(token, secret);
    return NextResponse.json(payload);
    } catch {
    return NextResponse.json({ message: 'Token inválido o expirado' }, { status: 401 });
    }
}