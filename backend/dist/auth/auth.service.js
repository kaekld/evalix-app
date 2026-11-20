"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const supabase_js_1 = require("@supabase/supabase-js");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    configService;
    jwtService;
    supabase;
    constructor(configService, jwtService) {
        this.configService = configService;
        this.jwtService = jwtService;
        this.supabase = (0, supabase_js_1.createClient)(this.configService.getOrThrow('SUPABASE_URL'), this.configService.getOrThrow('SUPABASE_ANON_KEY'));
    }
    async register(dto) {
        const rolNormalizado = (dto.role || 'alumno').toUpperCase();
        if (!['ALUMNO', 'DOCENTE', 'ADMINISTRADOR'].includes(rolNormalizado)) {
            throw new common_1.BadRequestException('Rol inválido. Usa alumno, docente o administrador');
        }
        const { data: existingUser } = await this.supabase
            .from('usuario')
            .select('id')
            .eq('correo', dto.email)
            .maybeSingle();
        if (existingUser) {
            throw new common_1.ConflictException('El correo ya está registrado');
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
            throw new common_1.BadRequestException(`Error al crear usuario: ${userError?.message}`);
        }
        if (rolNormalizado === 'ALUMNO') {
            const { error } = await this.supabase.from('alumno').insert({
                id: user.id,
                matricula: dto.matricula || null,
            });
            if (error)
                throw new common_1.BadRequestException(`Error al crear perfil de alumno: ${error.message}`);
        }
        else if (rolNormalizado === 'DOCENTE') {
            const { error } = await this.supabase.from('docente').insert({
                id: user.id,
                numero_empleado: dto.numero_empleado || null,
            });
            if (error)
                throw new common_1.BadRequestException(`Error al crear perfil de docente: ${error.message}`);
        }
        else if (rolNormalizado === 'ADMINISTRADOR') {
            const { error } = await this.supabase.from('administrador').insert({ id: user.id });
            if (error)
                throw new common_1.BadRequestException(`Error al crear administrador: ${error.message}`);
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
    async login(dto) {
        const { data: user, error } = await this.supabase
            .from('usuario')
            .select('*')
            .eq('correo', dto.email)
            .maybeSingle();
        if (error || !user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        if (!user.activo) {
            throw new common_1.UnauthorizedException('La cuenta se encuentra inactiva');
        }
        if (dto.role && user.rol !== dto.role.toUpperCase()) {
            throw new common_1.UnauthorizedException(`Este usuario no tiene el rol de ${dto.role}`);
        }
        const isMatch = await bcrypt.compare(dto.password, user.password_hash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map