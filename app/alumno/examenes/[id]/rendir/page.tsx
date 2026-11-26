import { cookies } from "next/headers";
import { ExamRendirClient } from "./ExamRendirClient";

export const dynamic = "force-dynamic";

export default async function ExamRendirPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: evaluacionId } = await params;
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  let iniciadoData: Awaited<ReturnType<typeof fetchIniciar>> | null = null;
  let error: string | null = null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/alumno/examenes/${evaluacionId}/iniciar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `auth_token=${authToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al iniciar evaluación");
    }

    iniciadoData = await res.json();
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : "Error desconocido";
  }

  return <ExamRendirClient initialData={iniciadoData} error={error} evaluacionId={evaluacionId} />;
}

async function fetchIniciar(evaluacionId: string, authToken: string | undefined) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/alumno/examenes/${evaluacionId}/iniciar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `auth_token=${authToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Error al iniciar evaluación");
  }

  return res.json();
}