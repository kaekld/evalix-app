import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt.guard';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'Registrar nuevo alumno, docente o administrador' })
    register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Iniciar sesión y obtener JWT' })
    login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
    getProfile(@Req() req: any) {
    return req.user;
    }
}