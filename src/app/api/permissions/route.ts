// src/app/api/permissions/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/lib/api";
import type {
    JwtPayload,
    UserRole,
    BackendPermission,
    AppPermissions,
    RolePermissionsResponse // <-- Importamos el nuevo tipo
} from "@/lib/definitions";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET no está definida");
}
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

/**
 * Esta función no cambia. Recibe el array de permisos
 * y lo procesa. Ahora le pasaremos el array correcto.
 */
const processPermissions = (
    role: UserRole,
    backendPerms: BackendPermission[] // Espera un array
): AppPermissions => {

    // 1. Convertir la lista en un Set
    const permSet = new Set(
        backendPerms.map(p => `${p.resource}:${p.action}`) // <-- Esta línea fallaba
    );

    // 2. Reglas de negocio
    const canManageUserRoles = (role === "Coordinador");

    // 3. Devolver el objeto procesado
    return {
        canReadUsers: permSet.has("users:read"),
        canCreateUser: permSet.has("users:create"),
        canUpdateUser: permSet.has("users:update"),
        canDeleteUser: permSet.has("users:delete"),
        canManageUserRoles: canManageUserRoles,
        canReadRoles: permSet.has("roles:read"),
        canUpdateRoles: permSet.has("roles:update"),
    };
};

export async function GET(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;

    if (!token) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    try {
        // 1. Verificar el token y obtener el ROL
        const { payload } = await jwtVerify<JwtPayload>(token, SECRET_KEY);
        const userRole = payload.role;

        if (!userRole) {
            throw new Error("Payload de JWT inválido, 'role' no encontrado.");
        }

        // 2. Llamar al backend real para obtener los permisos

        // *** LA CORRECCIÓN ESTÁ AQUÍ ***
        // (Línea 1) Usamos el nuevo tipo de respuesta: RolePermissionsResponse
        const response = await api.get<RolePermissionsResponse>(
            `/role-permissions/by-role/${userRole}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        // (Línea 2) Extraemos el array 'detailedPermissions' del objeto de respuesta
        const { detailedPermissions } = response.data;

        // (Línea 3) Verificación de seguridad
        if (!detailedPermissions || !Array.isArray(detailedPermissions)) {
            console.error("La respuesta del backend no tiene 'detailedPermissions' o no es un array.", response.data);
            throw new Error("Respuesta de permisos del backend malformada.");
        }

        // 3. Procesar los permisos (ahora le pasamos el array correcto)
        const appPermissions = processPermissions(userRole, detailedPermissions);

        return NextResponse.json(appPermissions);

    } catch (err: any) {
        // (El bloque 'catch' mejorado se mantiene)
        console.error("[ERROR EN /api/permissions]:", err);

        if (err.response) {
            console.error("Error del backend:", err.response.data);
            console.error("Status del backend:", err.response.status);
            return NextResponse.json(
                { message: "Error del backend al obtener permisos", backendError: err.response.data },
                { status: err.response.status }
            );
        } else if (err.request) {
            console.error("No hubo respuesta del backend:", err.request);
            return NextResponse.json(
                { message: "No se pudo conectar al servicio de Kustom API (revisa BACKEND_API_URL)" },
                { status: 503 }
            );
        } else {
            console.error("Error de configuración o JWT:", err.message);
        }

        return NextResponse.json(
            { message: `Error interno al procesar permisos: ${err.message}` },
            { status: 500 }
        );
    }
}