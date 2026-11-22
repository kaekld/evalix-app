"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdministradorRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/admin/panel");
    router.refresh();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-600">Redirigiendo al panel de administración...</p>
      </div>
    </div>
  );
}