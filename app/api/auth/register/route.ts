import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'evalix_secret_key_2026');

// Extraer dominio del email
function extraerDominio(email: string): string {
  const partes = email.split('@');
  return partes.length === 2 ? partes[1].toLowerCase() : '';
}

// Validar si el dominio está permitido para el rol
async function validarDominioPermitido(dominio: string, rol: string): Promise<{ valido: boolean; institucionId?: string }> {
  const rolNormalizado = rol.toUpperCase();
  let tipoRequerido = 'todos';
  
  if (rolNormalizado === 'ALUMNO') tipoRequerido = 'alumno';
  else if (rolNormalizado === 'DOCENTE') tipoRequerido = 'docente';
  else if (rolNormalizado === 'ADMINISTRADOR') tipoRequerido = 'administrador';

  // Buscar dominio exacto para el rol o tipo 'todos'
  const { data, error } = await supabase
    .from('dominio_permitido')
    .select('institucion_id')
    .eq('dominio', dominio)
    .eq('activo', true)
    .in('tipo', [tipoRequerido, 'todos'])
    .maybeSingle();

  if (error || !data) {
    return { valido: false };
  }

  return { valido: true, institucionId: data.institucion_id };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, institucion_id, password, role = 'alumno', matricula, numero_empleado } = body;

    if (!fullName || !email || !password || !institucion_id) {
      return NextResponse.json({ message: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const rolNormalizado = role.toUpperCase();
    // No permitir registro de administradores desde el formulario público
    if (rolNormalizado === 'ADMINISTRADOR') {
      return NextResponse.json({ message: 'No está permitido registrar administradores' }, { status: 403 });
    }
    if (!['ALUMNO', 'DOCENTE'].includes(rolNormalizado)) {
      return NextResponse.json({ message: 'Rol inválido' }, { status: 400 });
    }

    // Validar dominio del email
    const dominio = extraerDominio(email);
    if (!dominio) {
      return NextResponse.json({ message: 'Formato de correo inválido' }, { status: 400 });
    }

    const { valido, institucionId } = await validarDominioPermitido(dominio, rolNormalizado);
    if (!valido) {
      return NextResponse.json({ 
        message: `El dominio @${dominio} no está autorizado para el rol ${role}. Contacta a tu administrador.` 
      }, { status: 400 });
    }

    // Verificar que la institución seleccionada coincide con la del dominio
    if (institucionId !== institucion_id) {
      return NextResponse.json({ 
        message: 'La institución seleccionada no coincide con el dominio de tu correo' 
      }, { status: 400 });
    }

    // Validar matrícula requerida para alumnos
    if (rolNormalizado === 'ALUMNO' && (!matricula || !matricula.trim())) {
      return NextResponse.json({ message: 'La matrícula es obligatoria para alumnos' }, { status: 400 });
    }

    const correoNormalizado = email.trim().toLowerCase();

    const { data: existingUser } = await supabase
      .from('usuario')
      .select('id')
      .eq('correo', correoNormalizado)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({ message: 'El correo ya está registrado' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // El RPC inserta usuario + perfil de rol en una sola transacción.
    // Así no quedan usuarios sin fila en alumno/docente/administrador.
    const { data: rpcUser, error: userError } = await supabase.rpc('registrar_usuario', {
      p_nombre_completo: fullName.trim(),
      p_correo: correoNormalizado,
      p_institucion_id: institucion_id,
      p_password_hash: passwordHash,
      p_rol: rolNormalizado,
      p_matricula: rolNormalizado === 'ALUMNO' ? matricula.trim() : null,
      p_numero_empleado: rolNormalizado === 'DOCENTE' ? (numero_empleado?.trim() || null) : null,
    });

    if (userError || !rpcUser) {
      const errorMessage = userError?.message || 'Error al crear usuario';
      const isDuplicateEmail =
        errorMessage.includes('usuario_correo_key') ||
        errorMessage.includes('usuario_correo_lower_key');
      const isDuplicateMatricula = errorMessage.includes('alumno_matricula_key');

      return NextResponse.json(
        {
          message: isDuplicateEmail
            ? 'El correo ya está registrado'
            : isDuplicateMatricula
              ? 'La matrícula ya está registrada'
              : errorMessage,
        },
        { status: isDuplicateEmail || isDuplicateMatricula ? 409 : 400 },
      );
    }

    const user = (Array.isArray(rpcUser) ? rpcUser[0] : rpcUser) as {
      id: string;
      nombre_completo: string;
      correo: string;
      institucion_id: string;
      activo: boolean;
      rol: string;
    } | null;

    if (!user) {
      return NextResponse.json({ message: 'No se pudo crear el usuario' }, { status: 500 });
    }

    const safeUser = {
      id: user.id,
      nombre_completo: user.nombre_completo,
      correo: user.correo,
      institucion_id: user.institucion_id,
      activo: user.activo,
      rol: user.rol,
    };

    // Fetch institution name for JWT
    const { data: institucionData } = await supabase
      .from('institucion')
      .select('nombre')
      .eq('id', user.institucion_id)
      .maybeSingle();
    const institucion = institucionData?.nombre ?? null;

    const access_token = await new SignJWT({
      sub: safeUser.id,
      email: safeUser.correo,
      rol: safeUser.rol,
      nombre_completo: safeUser.nombre_completo,
      institucion,
      institucion_id: safeUser.institucion_id,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    const response = NextResponse.json(
      { message: 'Usuario registrado exitosamente', access_token, user: safeUser },
      { status: 201 },
    );

    response.cookies.set('auth_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ message }, { status: 500 });
  }
}