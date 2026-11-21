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

    const { data: existingUser } = await supabase
      .from('usuario')
      .select('id')
      .eq('correo', email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({ message: 'El correo ya está registrado' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: user, error: userError } = await supabase
      .from('usuario')
      .insert({
        nombre_completo: fullName,
        correo: email,
        institucion_id: institucion_id,
        password_hash: passwordHash,
        activo: true,
        rol: rolNormalizado,
      })
      .select('id, nombre_completo, correo, institucion_id, activo, rol')
      .single();

    if (userError || !user) {
      return NextResponse.json({ message: `Error al crear usuario: ${userError?.message}` }, { status: 400 });
    }

    if (rolNormalizado === 'ALUMNO') {
      const { error } = await supabase.from('alumno').insert({ id: user.id, matricula: matricula!.trim() });
      if (error) return NextResponse.json({ message: error.message }, { status: 400 });
    } else if (rolNormalizado === 'DOCENTE') {
      const { error } = await supabase.from('docente').insert({ id: user.id, numero_empleado: numero_empleado || null });
      if (error) return NextResponse.json({ message: error.message }, { status: 400 });
    } else if (rolNormalizado === 'ADMINISTRADOR') {
      const { error } = await supabase.from('administrador').insert({ id: user.id });
      if (error) return NextResponse.json({ message: error.message }, { status: 400 });
    }

    const access_token = await new SignJWT({ sub: user.id, email: user.correo, rol: user.rol })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    return NextResponse.json(
      { message: 'Usuario registrado exitosamente', access_token, user },
      { status: 201 },
    );
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Error interno' }, { status: 500 });
  }
}