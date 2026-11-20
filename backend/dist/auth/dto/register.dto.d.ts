export declare enum UserRole {
    ALUMNO = "ALUMNO",
    DOCENTE = "DOCENTE",
    ADMINISTRADOR = "ADMINISTRADOR"
}
export declare class RegisterDto {
    fullName: string;
    email: string;
    institution?: string;
    password: string;
    role?: string;
    matricula?: string;
    numero_empleado?: string;
}
