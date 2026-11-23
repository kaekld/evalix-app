import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import DocenteHeaderWrapper from "@/app/docente/components/DocenteHeaderWrapper";
import EvaluacionDetail from "@/app/docente/components/evaluaciones/EvaluacionDetail";

async function getEvaluacion(id: string, docenteId: string) {
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
    .from("evaluacion")
    .select(`
      *,
      grupo:grupo_id (id, nombre, codigo),
      preguntas:pregunta (
        *,
        opciones:opcion (*)
      )
    `)
    .eq("id", id)
    .eq("docente_id", docenteId)
    .single();

  if (error || !data) return null;

  // Transform data to match our types
  return {
    id: data.id,
    titulo: data.titulo,
    fecha: data.fecha_inicio ? new Date(data.fecha_inicio).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }) : "",
    hora: data.fecha_inicio ? new Date(data.fecha_inicio).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "",
    status: data.estado,
    grupoId: data.grupo_id,
    grupoNombre: data.grupo?.nombre || "",
    descripcion: data.descripcion,
    tiempoExamen: data.tiempo_por_pregunta, // Map DB column to frontend field
    ordenAleatorio: data.orden_aleatorio,
    preguntas: data.preguntas?.map((p: {
      id: string;
      evaluacion_id: string;
      tipo: string;
      enunciado: string;
      imagen_url: string | null;
      tiempo_segundos: number;
      orden: number;
      opciones?: Array<{ id: string; pregunta_id: string; texto: string; es_correcta: boolean }>;
    }) => ({
      id: p.id,
      evaluacionId: p.evaluacion_id,
      tipo: p.tipo,
      enunciado: p.enunciado,
      imagenUrl: p.imagen_url,
      tiempoSegundos: p.tiempo_segundos,
      orden: p.orden,
      opciones: p.opciones?.map((o) => ({
        id: o.id,
        preguntaId: o.pregunta_id,
        texto: o.texto,
        esCorrecta: o.es_correcta,
      })) || [],
    })) || [],
  };
}

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

export default async function EvaluacionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();

  if (!user) {
    notFound();
  }

  const [evaluacion, grupos] = await Promise.all([
    getEvaluacion(id, user.id),
    getGrupos(user.id),
  ]);

  if (!evaluacion) {
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
        <EvaluacionDetail initialEvaluacion={evaluacion} grupos={grupos} />
      </main>
    </div>
  );
}