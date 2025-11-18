// src/app/api/designs/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/lib/api";
import type { JwtPayload, CreateDesignDto, Design } from "@/lib/definitions";

const JWT_SECRET = process.env.JWT_SECRET!;
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

/**
 * GET /api/designs
 */
export async function GET(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;
    if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    try {
        await jwtVerify<JwtPayload>(token, SECRET_KEY);
        const response = await api.get<Design[]>("/designs", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return NextResponse.json(response.data);
    } catch (err: any) {
        return NextResponse.json({ message: "Error al obtener diseños" }, { status: 500 });
    }
}

/**
 * POST /api/designs
 * Crea un nuevo diseño. Inyecta el ID del usuario logueado.
 */
export async function POST(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;
    if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    try {
        // 1. Obtener ID del usuario del token
        const { payload } = await jwtVerify<JwtPayload>(token, SECRET_KEY);
        const userId = payload.sub;

        if (!userId) throw new Error("Token inválido: falta sub");

        // 2. Leer body del request
        const body = await req.json();

        // 3. Construir el DTO final inyectando el usuario
        const designData: CreateDesignDto = {
            ...body,
            user: userId, // <-- INYECCIÓN AUTOMÁTICA
        };

        // 4. Enviar al backend real
        const response = await api.post<Design>("/designs", designData, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return NextResponse.json(response.data, { status: 201 });

    } catch (err: any) {
        console.error("Error en POST /api/designs:", err.response?.data || err.message);
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || "Error al crear diseño";
        return NextResponse.json({ message }, { status });
    }
}