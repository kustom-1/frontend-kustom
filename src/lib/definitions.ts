// src/lib/definitions.ts

// Roles de Usuario
export enum UserRole {
    Coordinador = "Coordinador",
    Auxiliar = "Auxiliar",
    Consultor = "Consultor",
}

// Schemas DTO
export type CreateUserDto = {
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    password: string;
    role: UserRole;
};

export type AuthUserDto = {
    email: string;
    password: string;
};

// Modelo de Usuario (Consolidado)
// Este es el objeto que usaremos en toda la app (Redux, etc.)
export type User = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    isActive?: boolean; // Es opcional, ya que el /auth no lo devuelve
};

// Respuesta de Auth (Basado en tu ejemplo)
export type AuthResponse = {
    access_token: string;
    user: {
        // El ID no viene en este objeto, viene en el JWT (sub)
        firstName: string;
        lastName: string;
        role: UserRole;
        email: string;
    };
};

// Payload del JWT (Basado en tu ejemplo)
export type JwtPayload = {
    sub: number; // Este es el ID de usuario
    email: string;
    role: UserRole;
    iat: number;
    exp: number;
};

// --- Tipos de Permisos ---

/**
 * El objeto *individual* de permiso, basado en la respuesta real
 * que está dentro de 'detailedPermissions'.
 */
export type BackendPermission = {
    id: number;
    resource: string;
    action: string;
    role: UserRole;
    // ... (no necesitamos los otros campos por ahora)
};

/**
 * El objeto de respuesta *completo* del backend real:
 * GET /role-permissions/by-role/{role}
 * (Basado en el JSON que me enviaste)
 */
export type RolePermissionsResponse = {
    success: boolean;
    role: UserRole;
    permissions: string[]; // Array de strings simples
    detailedPermissions: BackendPermission[]; // <-- Este es el array que queremos
};

/**
 * El objeto de permisos procesado y fácil de usar
 * que nuestro BFF entregará al frontend.
 * (Este tipo no cambia)
 */
export type AppPermissions = {
    // Permisos de Usuario
    canReadUsers: boolean;
    canCreateUser: boolean;
    canUpdateUser: boolean;
    canDeleteUser: boolean;
    // Regla de negocio especial
    canManageUserRoles: boolean;

    // Permisos de Roles (futuro)
    canReadRoles: boolean;
    canUpdateRoles: boolean;

    // ...
};