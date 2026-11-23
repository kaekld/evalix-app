import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import DocenteHeaderWrapper from "@/app/docente/components/DocenteHeaderWrapper";
import GrupoConfiguracion from "@/app/docente/components/grupos/GrupoConfiguracion";

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
    .select("id, nombre, codigo, categoria, descripcion, activo, creado_en, actualizado_en, institucion_id")
    .eq("id", id)
    .eq("docente_id", docenteId)
    .single();

  if (error || !data) return null;
  return data;
}

async function getConfiguracion(grupoId: string) {
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
    .from("grupo_configuracion")
    .select("*")
    .eq("grupo_id", grupoId)
    .single();

  if (error && error.code !== "PGRST116") return null; // PGRST116 = no rows found
  return data;
}

async function getUser() {
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

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export default async function GrupoConfiguracionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();

  if (!user) {
    notFound();
  }

  const grupo = await getGrupo(id, user.id);

  if (!grupo) {
    notFound();
  }

  const configuracion = await getConfiguracion(id);

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
        <GrupoConfiguracion grupo={grupo} configuracion={configuracion} />
      </main>
    </div>
  );
}