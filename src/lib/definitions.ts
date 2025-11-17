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
    canManageUserRoles: boolean;

    // Permisos de Roles
    canReadRoles: boolean;
    canUpdateRoles: boolean;

    // Permisos de Categorías
    canReadCategories: boolean;
    canCreateCategory: boolean;
    canUpdateCategory: boolean;
    canDeleteCategory: boolean;

    // Permisos de Prendas
    canReadCloths: boolean;
    canCreateCloth: boolean;
    canUpdateCloth: boolean;
    canDeleteCloth: boolean;

    // Permisos de Stocks
    canReadStocks: boolean;
    canCreateStock: boolean;
    canUpdateStock: boolean;
    canDeleteStock: boolean;
};

// --- Tipos de Categoría ---
export type Category = {
    id: number;
    name: string;
    description?: string;
};

export type CreateCategoryDto = {
    name: string;
    description?: string;
};


// --- Tipos de Prendas (Cloths) ---

export type Cloth = {
    id: number;
    name: string;
    category: Category; // ID de la categoría
    basePrice?: number;
    description?: string;
    modelUrl?: string;
};

// (Basado en CreateClothDto del OAS)
export type CreateClothDto = {
    name: string;
    category: number | string; // ID de la categoría
    basePrice?: number;
    description?: string;
    modelUrl?: string;
};

// (Basado en UpdateClothDto del OAS, que está vacío)
export type UpdateClothDto = Partial<CreateClothDto>;

// --- Tipos de Stock ---
// (Basado en CreateStockDto del OAS)
export type CreateStockDto = {
    gender?: string;
    color?: string;
    size?: string;
    stock: number;
    cloth: number; // ID de la Prenda
};

// (Asumimos que el DTO de respuesta es similar)
export type Stock = {
    id: number;
    gender?: string;
    color?: string;
    size?: string;
    stock: number;
    cloth: Cloth; // <-- Asumimos que la respuesta trae el objeto 'Cloth' anidado
};

export type UpdateStockDto = Partial<CreateStockDto>;