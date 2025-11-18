// src/app/api/role-permissions/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/lib/api";
import type { JwtPayload, RolePermission, UpdateRolePermissionDto } from "@/lib/definitions";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) { throw new Error("JWT_SECRET no está definida"); }
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

function getIdFromUrl(pathname: string): string | undefined {
    const parts = pathname.split('/');
    return parts[parts.length - 1];
}

/**
 * PUT /api/role-permissions/[id]
 */
export async function PUT(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;
    let permissionId: string | undefined;
    if (!token) { return NextResponse.json({ message: "No autorizado" }, { status: 401 }); }

    try {
        await jwtVerify<JwtPayload>(token, SECRET_KEY);
        const body: UpdateRolePermissionDto = await req.json();

        permissionId = getIdFromUrl(req.nextUrl.pathname);
        if (!permissionId || isNaN(Number(permissionId))) {
            throw new Error("ID de permiso inválido desde la URL.");
        }

        const response = await api.put<RolePermission>(`/role-permissions/${permissionId}`, body, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return NextResponse.json(response.data);
    } catch (err: any) {
        console.error(`Error en PUT /api/role-permissions/${permissionId || 'ID_DESCONOCIDO'}:`, err.message);
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || "Error al actualizar permiso";
        return NextResponse.json({ message }, { status });
    }
}

/**
 * DELETE /api/role-permissions/[id]
 */
export async function DELETE(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;
    let permissionId: string | undefined;
    if (!token) { return NextResponse.json({ message: "No autorizado" }, { status: 401 }); }

    try {
        await jwtVerify<JwtPayload>(token, SECRET_KEY);

        // Forzar resolución de 'params'
        const _ = req.nextUrl.pathname;
        await req.text();

        permissionId = getIdFromUrl(req.nextUrl.pathname);
        if (!permissionId || isNaN(Number(permissionId))) {
            throw new Error("ID de permiso inválido desde la URL.");
        }

        await api.delete(`/role-permissions/${permissionId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return NextResponse.json({ message: "Permiso eliminado" }, { status: 200 });
    } catch (err: any) {
        console.error(`Error en DELETE /api/role-permissions/${permissionId || 'ID_DESCONOCIDO'}:`, err.message);
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || "Error al eliminar permiso";
        return NextResponse.json({ message }, { status });
    }
}