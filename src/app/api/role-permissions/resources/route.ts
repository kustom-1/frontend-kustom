// src/app/api/role-permissions/resources/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/lib/api";
import type { JwtPayload, ResourceList } from "@/lib/definitions";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) { throw new Error("JWT_SECRET no está definida"); }
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

/**
 * GET /api/role-permissions/resources
 * Obtiene la lista de recursos disponibles.
 */
export async function GET(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;
    if (!token) { return NextResponse.json({ message: "No autorizado" }, { status: 401 }); }

    try {
        await jwtVerify<JwtPayload>(token, SECRET_KEY);
        const response = await api.get<ResourceList>("/role-permissions/resources", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return NextResponse.json(response.data);
    } catch (err: any) {
        console.error("Error en GET /api/role-permissions/resources:", err.message);
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || "Error al obtener recursos";
        return NextResponse.json({ message }, { status });
    }
}