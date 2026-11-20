import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export enum UserRole {
  ALUMNO = 'ALUMNO',
  DOCENTE = 'DOCENTE',
  ADMINISTRADOR = 'ADMINISTRADOR',
}

export class RegisterDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'juan.perez@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Universidad Nacional' })
  @IsString()
  @IsOptional()
  institution?: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: ['alumno', 'docente'], default: 'alumno' })
  @IsEnum(['alumno', 'docente'])
  @IsOptional()
  role?: string = 'alumno';

  @ApiProperty({ example: '20230001', required: false })
  @IsString()
  @IsOptional()
  matricula?: string;

  @ApiProperty({ example: 'E123456', required: false })
  @IsString()
  @IsOptional()
  numero_empleado?: string;
}
