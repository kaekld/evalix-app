import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import Carousel from "./components/Carousel";
import LoginForm from "./components/LoginForm";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'evalix_secret_key_2026');

async function getUserRole(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.rol as string;
  } catch {
    return null;
  }
}

export default async function LoginPage() {
  const role = await getUserRole();
  
  // Si ya hay sesión válida, redirigir al dashboard correspondiente
  if (role) {
    const dashboard = role === 'DOCENTE' ? '/docente' : role === 'ADMINISTRADOR' ? '/administrador' : '/alumno';
    redirect(dashboard);
  }
  
  return (
    <main className="flex min-h-screen flex-1 bg-zinc-50">
      <Carousel />
      <LoginForm />
    </main>
  );
}
