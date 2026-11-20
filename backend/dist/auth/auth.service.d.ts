import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private configService;
    private jwtService;
    private supabase;
    constructor(configService: ConfigService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        message: string;
        access_token: string;
        user: {
            id: any;
            nombre_completo: any;
            correo: any;
            institucion: any;
            activo: any;
            rol: any;
        };
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            nombre_completo: any;
            correo: any;
            institucion: any;
            rol: any;
        };
    }>;
}
