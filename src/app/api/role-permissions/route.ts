// src/app/api/role-permissions/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/lib/api";
import type { JwtPayload, RolePermission, CreateRolePermissionDto } from "@/lib/definitions";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) { throw new Error("JWT_SECRET no está definida"); }
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

/**
 * POST /api/role-permissions
 * Crea una nueva regla de permiso.
 */
export async function POST(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;
    if (!token) { return NextResponse.json({ message: "No autorizado" }, { status: 401 }); }

    try {
        await jwtVerify<JwtPayload>(token, SECRET_KEY);
        const body: CreateRolePermissionDto = await req.json();

        const response = await api.post<RolePermission>("/role-permissions", body, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return NextResponse.json(response.data, { status: 201 });
    } catch (err: any) {
        console.error("Error en POST /api/role-permissions:", err.message);
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || "Error al crear permiso";
        return NextResponse.json({ message }, { status });
    }
}