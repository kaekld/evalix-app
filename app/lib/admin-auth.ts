import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'evalix_secret_key_2026');

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.sub as string,
      email: payload.email as string,
      rol: payload.rol as string,
      nombre_completo: payload.nombre_completo as string,
      institucion: payload.institucion as string,
      institucion_id: payload.institucion_id as string,
    };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session || session.rol !== 'ADMINISTRADOR') {
    return null;
  }
  return session;
}