import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import AdminPanel from "./components/AdminPanel";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'evalix_secret_key_2026');

async function getAdminUser(): Promise<{ id: string; email: string; nombre_completo: string; institucion: string; institucion_id: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.sub as string,
      email: payload.email as string,
      nombre_completo: payload.nombre_completo as string,
      institucion: payload.institucion as string,
      institucion_id: payload.institucion_id as string,
    };
  } catch {
    return null;
  }
}

export default async function AdminPanelPage() {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/admin");
  }

  return <AdminPanel admin={admin} />;
}