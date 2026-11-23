import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import DocenteHeaderWrapper from "@/app/docente/components/DocenteHeaderWrapper";
import GrupoDetalle from "@/app/docente/components/grupos/GrupoDetalle";

async function getGrupo(id: string, docenteId: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase
    .from("grupo")
    .select(`
      *,
      grupo_estudiante!inner(count)
    `)
    .eq("id", id)
    .eq("docente_id", docenteId)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    estudiantes_count: data.grupo_estudiante?.[0]?.count ?? 0,
  };
}

interface JWTPayload {
  sub: string;
  email: string;
  nombre_completo?: string;
  institucion?: string | null;
  institucion_id?: string | null;
  rol?: string;
}

async function getUser() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('auth_token');
  const token = authCookie?.value;

  if (!token) return null;

  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'evalix_secret_key_2026');

  try {
    const { payload } = await jwtVerify<JWTPayload>(token, secret);
    return {
      id: payload.sub,
      email: payload.email,
      user_metadata: {
        nombre_completo: payload.nombre_completo,
        institucion: payload.institucion,
        institucion_id: payload.institucion_id,
        rol: payload.rol,
      },
    };
  } catch {
    return null;
  }
}

export default async function GrupoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();

  if (!user) {
    notFound();
  }

  const grupo = await getGrupo(id, user.id);

  if (!grupo) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f6f6fa] flex flex-col font-sans">
      <DocenteHeaderWrapper
        user={{
          id: user.id,
          nombre_completo: user.user_metadata?.nombre_completo || user.email || "Docente",
          correo: user.email || "",
          institucion: user.user_metadata?.institucion || null,
          institucion_id: user.user_metadata?.institucion_id || null,
          rol: user.user_metadata?.rol || "DOCENTE",
        }}
      />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <GrupoDetalle grupo={grupo} />
      </main>
    </div>
  );
}