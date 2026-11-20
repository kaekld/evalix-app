import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(req: any): any;
}
