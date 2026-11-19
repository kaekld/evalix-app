export default function DocenteHomePage() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-purple-600 mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight">
            Panel Docente
          </h1>
          <p className="mt-4 text-lg text-zinc-600 max-w-2xl mx-auto">
            Bienvenido a tu espacio docente. Desde aquí podrás gestionar tus cursos, evaluaciones y estudiantes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <a href="/docente/cursos" className="group p-6 bg-white rounded-xl border border-zinc-200 hover:border-purple-300 hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-lg bg-purple-100 group-hover:bg-purple-600 transition-colors flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">Mis Cursos</h3>
            <p className="text-zinc-600">Gestiona tus materias, horarios y contenido</p>
          </a>

          <a href="/docente/evaluaciones" className="group p-6 bg-white rounded-xl border border-zinc-200 hover:border-purple-300 hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-lg bg-purple-100 group-hover:bg-purple-600 transition-colors flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">Evaluaciones</h3>
            <p className="text-zinc-600">Crea, programa y califica exámenes y tareas</p>
          </a>

          <a href="/docente/estudiantes" className="group p-6 bg-white rounded-xl border border-zinc-200 hover:border-purple-300 hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-lg bg-purple-100 group-hover:bg-purple-600 transition-colors flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">Estudiantes</h3>
            <p className="text-zinc-600">Ver matrícula, progreso y seguimiento individual</p>
          </a>
        </div>

        <div className="mt-12 text-center">
          <a href="/login" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Cerrar sesión
          </a>
        </div>
      </div>
    </main>
  );
}