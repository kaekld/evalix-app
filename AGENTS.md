<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->

# Reglas de Arquitectura y Componentización (Next.js)
- NUNCA escribas interfaces complejas directamente dentro de `app/**/page.tsx`. Los archivos `page.tsx` deben funcionar solo como ensambladores de layout y obtención de datos (Server Components).
- Todo bloque de UI reutilizable o sección independiente debe extraerse a `src/components/` (o `components/`).
- Si un componente supera las 120 líneas de código o maneja más de una responsabilidad, divídelo inmediatamente en subcomponentes atómicos.
- Separa la lógica interactiva (`"use client"`) en componentes hoja pequeños para mantener las páginas principales como Server Components.

# Evalix Web

## 1. Visión General y Reglas Globales
- Plataforma de evaluaciones académicas con control de acceso por rol, revisión mixta (automática y manual) y observador de telemetría antifraude.
- **Dispositivos:** El acceso a menús y paneles de gestión puede realizarse desde cualquier dispositivo, pero el **motor del examen es estrictamente exclusivo para PC** (computadoras de escritorio o laptops). El acceso al motor del examen desde dispositivos móviles debe bloquearse.
- **Telemetría y editores:** No se usa un canvas de dibujo con ratón para evitar inactividad ni rastrear conducta. El rastreo de eventos y telemetría durante el examen se apoya en **librerías externas** (por ejemplo, **Monaco Editor** para capturar eventos como *copy/paste*, escritura manual, edición o patrones sospechosos).
- **Documentación detallada:** Si requieres especificaciones extensas o flujos adicionales de Notion, colócalas en `docs/` y enlázalas desde aquí.

---

## 2. Roles y Permisos
- **Administrador:** Acceso total al sistema (cuentas, grupos y exámenes asignados).
- **Docente:** Panel de gestión para administrar grupos, crear/asignar exámenes, revisar respuestas abiertas, consultar capturas individuales, gestionar incidencias/conexiones y devolver acceso cuando corresponda.
- **Alumno:** Menú para consultar materias, grupos, exámenes próximos y realizados, responder exámenes asignados, solicitar revisiones y editar datos permitidos (como nombre y contraseña).

---

## 3. Autenticación y Cuentas
- Registro/acceso restringido a correo institucional o correos explícitamente permitidos por el sistema.
- Inicio de sesión mediante correo y contraseña.
- Flujo de recuperación/cambio de contraseña en caso de pérdida.
- Las contraseñas deben cumplir criterios de seguridad definidos y las cuentas cuentan con límite de sesión.

---

## 4. Motor del Examen y Reglas de Evaluación
- **Programación y alcance:** Horario asignado para entrar y contestar; puede aplicarse a un grupo completo, a ciertos alumnos o de forma individual.
- **Preguntas y respuestas:**
  - Preguntas abiertas o cerradas (opción única); se admite imagen de referencia en las preguntas.
  - No se permiten archivos adjuntos como respuesta.
  - Orden configurable por el docente (ordenado o aleatorio/sin orden fijo según elección).
- **Tiempo y bloqueo:**
  - Tiempo designado por pregunta.
  - Una vez que el alumno avanza de pregunta, **no puede editar respuestas anteriores**.
- **Calificación:**
  - Preguntas cerradas: revisión automática.
  - Preguntas abiertas: revisión manual por el docente.
  - El alumno puede solicitar revisión y consultar los resultados/calificación una vez completada la revisión correspondiente.

---

## 5. Observador Antifraude y Manejo de Incidencias
- **Señales monitoreadas:**
  - Cambio de pestaña o ventana (con margen de tolerancia de pocos segundos para regresos accidentales).
  - Inactividad prolongada o patrones anómalos.
  - Eventos capturados mediante librerías externas como **Monaco Editor** (ej. pegado de texto/código, escritura manual vs. inserciones bruscas, pausas irregulares).
- **Caída de conexión y cancelación:**
  - Si el alumno pierde conexión a internet a mitad de una pregunta cronometrada, **el examen se cancela automáticamente** y se envía notificación inmediata al docente.
  - El alumno debe explicar lo ocurrido al docente; si este lo aprueba, puede **reabrir el examen** (continuando desde donde quedó) o **asignar uno nuevo**.
- **Intervención del docente:** El docente puede cancelar manualmente un examen o devolver el acceso según su criterio ante falsos positivos de detección de trampa o inconvenientes externos.

---

## 6. Módulos y Vistas Clave
- **Panel Docente:** Gestión de grupos (creación o asignación por el sistema, alta/baja manual de alumnos), creación/configuración de exámenes (tema, horario de entrada, tiempos, preguntas, imágenes), seguimiento de alumnos, historial por alumno (solo de exámenes aplicados por el docente), revisión manual, visor de capturas individuales y control de reaperturas/cancelaciones.
- **Portal Alumno:** Pantalla principal con exámenes más próximos, selección por materia, listado de grupos y sus exámenes realizados, historial/resultados tras revisión, solicitud de revisión y edición de perfil (nombre y contraseña).

---

## 7. Convenciones para el Agente
- Mantén la lógica del motor de examen desacoplada y verificable (estados de tiempo, bloqueo por pregunta, validación de dispositivo de escritorio y manejo de pérdida de conexión).
- Al integrar editores o rastreadores de telemetría (como Monaco), centraliza los eventos en un módulo/servicio claro para facilitar auditoría y pruebas.
- Evita agregar dependencias innecesarias y verifica que el build de Next.js pase sin errores de tipos ni lint antes de dar una tarea por cerrada.

## Idioma y comunicación
- Responde **siempre en español** en todos tus mensajes, explicaciones, resúmenes y comentarios de código, incluso si el prompt incluye nombres de archivos, rutas, variables o términos técnicos en inglés.
- Mantén las explicaciones breves y directas, sin cambiar el idioma a inglés en ningún turno.
