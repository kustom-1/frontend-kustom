// src/app/api/cloths/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/lib/api";
import type { JwtPayload, Cloth, CreateClothDto } from "@/lib/definitions";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET no está definida");
}
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

/**
 * GET /api/cloths
 * Obtiene la lista de todas las prendas.
 */
export async function GET(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;

    if (!token) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    try {
        // Validar el token
        await jwtVerify<JwtPayload>(token, SECRET_KEY);

        // Llamar al backend real (Kustom API) con el token
        const response = await api.get<Cloth[]>("/cloths", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return NextResponse.json(response.data);

    } catch (err: any) {
        console.error("Error en GET /api/cloths:", err.message);
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || "Error al obtener prendas";
        return NextResponse.json({ message }, { status });
    }
}

/**
 * POST /api/cloths
 * Crea una nueva prenda.
 */
export async function POST(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;

    if (!token) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    try {
        // Validar el token
        await jwtVerify<JwtPayload>(token, SECRET_KEY);
        const body: CreateClothDto = await req.json();

        // Llamamos al backend real
        const response = await api.post<Cloth>("/cloths", body, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return NextResponse.json(response.data, { status: 201 });

    } catch (err: any) {
        console.error("Error en POST /api/cloths:", err.message);
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || "Error al crear prenda";
        return NextResponse.json({ message }, { status });
    }
}