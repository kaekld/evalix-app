import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import DocenteHeaderWrapper from "@/app/docente/components/DocenteHeaderWrapper";
import EstudiantesGlobal from "@/app/docente/components/estudiantes/EstudiantesGlobal";

async function getGrupos(docenteId: string) {
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
    .select("id, nombre, codigo")
    .eq("docente_id", docenteId)
    .eq("activo", true);

  if (error || !data) return [];

  return data.map((g: { id: string; nombre: string; codigo: string }) => ({
    id: g.id,
    nombre: g.nombre,
    codigo: g.codigo,
  }));
}

async function getEstudiantes(docenteId: string, limit = 20, offset = 0) {
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

  // Get teacher's groups first
  const { data: grupos } = await supabase
    .from('grupo')
    .select('id')
    .eq('docente_id', docenteId);

  if (!grupos || grupos.length === 0) {
    return { estudiantes: [], total: 0 };
  }

  const grupoIds = grupos.map(g => g.id);

  const { data, error, count } = await supabase
    .from('grupo_estudiante')
    .select(`
      id,
      grupo_id,
      alumno_id,
      inscrito_en,
      activo,
      alumno:alumno_id (
        id,
        matricula,
        usuario (id, nombre_completo, correo, activo)
      ),
      grupo:grupo_id (id, nombre, codigo)
    `, { count: 'exact' })
    .in('grupo_id', grupoIds)
    .order('inscrito_en', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) return { estudiantes: [], total: 0 };

  interface GrupoEstudianteRow {
    id: string;
    grupo_id: string;
    alumno_id: string;
    inscrito_en: string;
    activo: boolean;
    alumno: Array<{ id: string; matricula: string; usuario: Array<{ id: string; nombre_completo: string; correo: string; activo: boolean }> | null }> | { id: string; matricula: string; usuario: Array<{ id: string; nombre_completo: string; correo: string; activo: boolean }> | null } | null;
    grupo: Array<{ id: string; nombre: string; codigo: string }> | { id: string; nombre: string; codigo: string } | null;
  }

  const formatted = data.map((e: GrupoEstudianteRow) => {
    const alumno = Array.isArray(e.alumno) ? e.alumno[0] : e.alumno;
    const usuario = alumno?.usuario
      ? (Array.isArray(alumno.usuario) ? alumno.usuario[0] : alumno.usuario)
      : null;
    const grupo = Array.isArray(e.grupo) ? e.grupo[0] : e.grupo;
    return {
      id: e.id,
      grupo_id: e.grupo_id,
      grupo_nombre: grupo?.nombre || '',
      grupo_codigo: grupo?.codigo || '',
      alumno_id: e.alumno_id,
      inscrito_en: e.inscrito_en,
      activo: e.activo,
      alumno: {
        id: alumno?.id || '',
        matricula: alumno?.matricula || '',
        nombre_completo: usuario?.nombre_completo || '',
        correo: usuario?.correo || '',
        usuario_activo: usuario?.activo ?? true,
      },
    };
  });

  return { estudiantes: formatted, total: count ?? 0 };
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

export default async function DocenteEstudiantesPage() {
  const user = await getUser();

  if (!user) {
    notFound();
  }

  const [grupos, estudiantesData] = await Promise.all([
    getGrupos(user.id),
    getEstudiantes(user.id),
  ]);

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
        <EstudiantesGlobal
          grupos={grupos}
          initialEstudiantes={estudiantesData.estudiantes}
          initialTotal={estudiantesData.total}
        />
      </main>
    </div>
  );
}