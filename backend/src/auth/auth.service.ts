import {
    BadRequestException,
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    private supabase: SupabaseClient;

    constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    ) {
    this.supabase = createClient(
        this.configService.getOrThrow<string>('SUPABASE_URL'),
        this.configService.getOrThrow<string>('SUPABASE_ANON_KEY'),
    );
    }

    async register(dto: RegisterDto) {
    const rolNormalizado = (dto.role || 'alumno').toUpperCase();
    if (!['ALUMNO', 'DOCENTE', 'ADMINISTRADOR'].includes(rolNormalizado)) {
        throw new BadRequestException('Rol inválido. Usa alumno, docente o administrador');
    }

    const { data: existingUser } = await this.supabase
        .from('usuario')
        .select('id')
        .eq('correo', dto.email)
        .maybeSingle();

    if (existingUser) {
        throw new ConflictException('El correo ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const { data: user, error: userError } = await this.supabase
        .from('usuario')
        .insert({
        nombre_completo: dto.fullName,
        correo: dto.email,
        institucion: dto.institution || null,
        password_hash: passwordHash,
        activo: true,
        rol: rolNormalizado,
        })
        .select('id, nombre_completo, correo, institucion, activo, rol')
        .single();

    if (userError || !user) {
        throw new BadRequestException(`Error al crear usuario: ${userError?.message}`);
    }

    if (rolNormalizado === 'ALUMNO') {
        const { error } = await this.supabase.from('alumno').insert({
        id: user.id,
        matricula: dto.matricula || null,
        });
        if (error) throw new BadRequestException(`Error al crear perfil de alumno: ${error.message}`);
    } else if (rolNormalizado === 'DOCENTE') {
        const { error } = await this.supabase.from('docente').insert({
        id: user.id,
        numero_empleado: dto.numero_empleado || null,
        });
        if (error) throw new BadRequestException(`Error al crear perfil de docente: ${error.message}`);
    } else if (rolNormalizado === 'ADMINISTRADOR') {
        const { error } = await this.supabase.from('administrador').insert({ id: user.id });
        if (error) throw new BadRequestException(`Error al crear administrador: ${error.message}`);
    }

    const access_token = await this.jwtService.signAsync({
        sub: user.id,
        email: user.correo,
        rol: user.rol,
    });

    return {
        message: 'Usuario registrado exitosamente',
        access_token,
        user,
    };
    }

    async login(dto: LoginDto) {
    const { data: user, error } = await this.supabase
        .from('usuario')
        .select('*')
        .eq('correo', dto.email)
        .maybeSingle();

    if (error || !user) {
        throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.activo) {
        throw new UnauthorizedException('La cuenta se encuentra inactiva');
    }

    if (dto.role && user.rol !== dto.role.toUpperCase()) {
        throw new UnauthorizedException(`Este usuario no tiene el rol de ${dto.role}`);
    }

    const isMatch = await bcrypt.compare(dto.password, user.password_hash);
    if (!isMatch) {
        throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, email: user.correo, rol: user.rol };
    const access_token = await this.jwtService.signAsync(payload);

    return {
        access_token,
        user: {
        id: user.id,
        nombre_completo: user.nombre_completo,
        correo: user.correo,
        institucion: user.institucion,
        rol: user.rol,
        },
    };
        }
}