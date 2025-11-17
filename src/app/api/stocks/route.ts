// src/app/api/stocks/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/lib/api";
import type { JwtPayload, Stock, CreateStockDto } from "@/lib/definitions";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET no está definida");
}
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

/**
 * GET /api/stocks
 * Obtiene la lista de todo el inventario.
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
        const response = await api.get<Stock[]>("/stocks", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return NextResponse.json(response.data);

    } catch (err: any) {
        console.error("Error en GET /api/stocks:", err.message);
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || "Error al obtener inventario";
        return NextResponse.json({ message }, { status });
    }
}

/**
 * POST /api/stocks
 * Crea un nuevo registro de stock.
 */
export async function POST(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;

    if (!token) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    try {
        // Validar el token
        await jwtVerify<JwtPayload>(token, SECRET_KEY);
        const body: CreateStockDto = await req.json();

        // Llamamos al backend real
        const response = await api.post<Stock>("/stocks", body, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return NextResponse.json(response.data, { status: 201 });

    } catch (err: any) {
        console.error("Error en POST /api/stocks:", err.message);
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || "Error al crear inventario";
        return NextResponse.json({ message }, { status });
    }
}