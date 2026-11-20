import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'juan.perez@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123' })
    @IsNotEmpty()
    @IsString()
    password: string;

    @ApiPropertyOptional({ example: 'alumno', enum: ['alumno', 'docente', 'administrador'] })
    @IsOptional()
    @IsString()
    role?: string;
}