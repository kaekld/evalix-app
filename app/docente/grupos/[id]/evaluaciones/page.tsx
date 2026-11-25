import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import DocenteHeaderWrapper from "@/app/docente/components/DocenteHeaderWrapper";
import GrupoEvaluacionesClient from "@/app/docente/components/grupos/GrupoEvaluacionesClient";

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
    .select("id, nombre, codigo, categoria, descripcion, activo, creado_en, actualizado_en, institucion_id, docente_id")
    .eq("id", id)
    .eq("docente_id", docenteId)
    .single();

  if (error || !data) return null;

  return data;
}

async function getEvaluaciones(grupoId: string): Promise<ApiEvaluacion[]> {
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
      id,
      titulo,
      descripcion,
      fecha_inicio,
      fecha_fin,
      estado,
      tiempo_examen,
      orden_aleatorio,
      creado_en,
      actualizado_en,
      grupo_id,
      pregunta:pregunta (
        id,
        tipo,
        enunciado,
        imagen_url,
        tiempo_segundos,
        orden,
        codigo_inicial,
        opcion:opcion (
          id,
          texto,
          es_correcta,
          orden
        )
      )
    `)
    .eq("grupo_id", grupoId)
    .order("creado_en", { ascending: false });

  if (error || !data) return [];

  interface PreguntaRow {
    id: string;
    tipo: string;
    enunciado: string;
    imagen_url: string | null;
    tiempo_segundos: number;
    orden: number;
    codigo_inicial: string | null;
    opcion: Array<{ id: string; texto: string; es_correcta: boolean; orden: number }> | null;
  }

  interface EvaluacionRow {
    id: string;
    titulo: string;
    descripcion: string | null;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
    tiempo_examen: number;
    orden_aleatorio: boolean;
    creado_en: string;
    actualizado_en: string;
    grupo_id: string;
    pregunta: PreguntaRow[] | null;
  }

  return data.map((e: EvaluacionRow) => ({
    id: e.id,
    titulo: e.titulo,
    descripcion: e.descripcion,
    fecha_inicio: e.fecha_inicio,
    fecha_fin: e.fecha_fin,
    estado: e.estado as "pendiente" | "publicada" | "finalizada",
    tiempo_examen: e.tiempo_examen,
    orden_aleatorio: e.orden_aleatorio,
    creado_en: e.creado_en,
    actualizado_en: e.actualizado_en,
    grupo_id: e.grupo_id,
    grupoNombre: "", // Will be filled by parent
    grupoCodigo: "", // Will be filled by parent
    preguntas: e.pregunta?.map((p: PreguntaRow) => ({
      id: p.id,
      tipo: p.tipo,
      enunciado: p.enunciado,
      imagen_url: p.imagen_url,
      tiempo_segundos: p.tiempo_segundos,
      orden: p.orden,
      codigo_inicial: p.codigo_inicial,
      opciones: p.opcion?.map((o) => ({
        id: o.id,
        texto: o.texto,
        es_correcta: o.es_correcta,
        orden: o.orden,
      })) || [],
    })) || [],
  }));
}

interface ApiEvaluacion {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  estado: "pendiente" | "publicada" | "finalizada";
  tiempo_examen: number;
  orden_aleatorio: boolean;
  creado_en: string;
  actualizado_en: string;
  grupo_id: string;
  grupoNombre: string;
  grupoCodigo: string;
  preguntas: Array<{
    id: string;
    tipo: string;
    enunciado: string;
    imagen_url: string | null;
    tiempo_segundos: number;
    orden: number;
    codigo_inicial: string | null;
    opciones: Array<{ id: string; texto: string; es_correcta: boolean; orden: number }>;
  }>;
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

export default async function GrupoEvaluacionesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();

  if (!user) {
    notFound();
  }

  const [grupo, evaluaciones] = await Promise.all([
    getGrupo(id, user.id),
    getEvaluaciones(id),
  ]);

  if (!grupo) {
    notFound();
  }

  // Add group info to each evaluation
  const evaluacionesConGrupo = evaluaciones.map((e) => ({
    ...e,
    grupoNombre: grupo.nombre,
    grupoCodigo: grupo.codigo,
  }));

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
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <GrupoEvaluacionesClient
          grupo={grupo}
          initialEvaluaciones={evaluacionesConGrupo}
        />
      </main>
    </div>
  );
}