// src/app/api/role-permissions/[role]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/lib/api";
import type { JwtPayload, RolePermission, RolePermissionsResponse } from "@/lib/definitions";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) { throw new Error("JWT_SECRET no está definida"); }
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

function getRoleFromUrl(pathname: string): string | undefined {
    const parts = pathname.split('/');
    return parts[parts.length - 1];
}

/**
 * GET /api/role-permissions/[role]
 * Obtiene los permisos para un rol específico.
 */
export async function GET(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;
    let role: string | undefined;
    if (!token) { return NextResponse.json({ message: "No autorizado" }, { status: 401 }); }

    try {
        await jwtVerify<JwtPayload>(token, SECRET_KEY);

        role = getRoleFromUrl(req.nextUrl.pathname);
        if (!role) {
            throw new Error("Rol no especificado en la URL.");
        }

        // (Asumiendo que la respuesta es el objeto completo que me diste)
        const response = await api.get<RolePermissionsResponse>(
            `/role-permissions/by-role/${role}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        // Extraemos solo el array 'detailedPermissions' para el frontend
        const detailedPermissions = response.data.detailedPermissions;

        if (!detailedPermissions || !Array.isArray(detailedPermissions)) {
            throw new Error("Respuesta de permisos del backend malformada.");
        }

        return NextResponse.json(detailedPermissions);

    } catch (err: any) {
        console.error(`Error en GET /api/role-permissions/${role || 'ROL_DESCONOCIDO'}:`, err.message);
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || "Error al obtener permisos";
        return NextResponse.json({ message }, { status });
    }
}