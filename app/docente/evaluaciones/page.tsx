import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import DocenteHeaderWrapper from "@/app/docente/components/DocenteHeaderWrapper";
import ExamenesPanel from "@/app/docente/components/exams/ExamenesPanel";
import type { GrupoOption } from "@/app/docente/components/exams/types";

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
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "evalix_secret_key_2026",
  );

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

async function getGrupos(docenteId: string): Promise<GrupoOption[]> {
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
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  const { data, error } = await supabase
    .from("grupo")
    .select("id, nombre, codigo")
    .eq("docente_id", docenteId)
    .eq("activo", true)
    .order("nombre");

  if (error || !data) return [];

  return data as GrupoOption[];
}

export default async function DocenteExamenesPage() {
  const user = await getUser();

  if (!user) {
    notFound();
  }

  const grupos = await getGrupos(user.id);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)] font-sans">
      <DocenteHeaderWrapper
        user={{
          id: user.id,
          nombre_completo:
            user.user_metadata?.nombre_completo || user.email || "Docente",
          correo: user.email || "",
          institucion: user.user_metadata?.institucion || null,
          institucion_id: user.user_metadata?.institucion_id || null,
          rol: user.user_metadata?.rol || "DOCENTE",
        }}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <ExamenesPanel grupos={grupos} />
      </main>
    </div>
  );
}
