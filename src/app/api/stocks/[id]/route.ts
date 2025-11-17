// src/app/api/stocks/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/lib/api";
import type { JwtPayload, Stock, UpdateStockDto } from "@/lib/definitions";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET no está definida");
}
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

// --- FUNCIÓN HELPER (La corrección del bug de params) ---
function getIdFromUrl(pathname: string): string | undefined {
    const parts = pathname.split('/');
    return parts[parts.length - 1];
}

/**
 * PUT /api/stocks/[id]
 * Actualiza un registro de stock específico.
 */
export async function PUT(
    req: NextRequest
) {
    const token = req.cookies.get("kustom_token")?.value;
    let stockId: string | undefined;

    if (!token) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    try {
        await jwtVerify<JwtPayload>(token, SECRET_KEY);
        const body: UpdateStockDto = await req.json(); // Primer await

        // Obtenemos el ID desde la URL
        stockId = getIdFromUrl(req.nextUrl.pathname);
        if (!stockId || isNaN(Number(stockId))) {
            throw new Error("No se pudo leer un ID de stock válido desde la URL.");
        }

        // Llamamos al backend real
        const response = await api.put<Stock>(`/stocks/${stockId}`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return NextResponse.json(response.data);

    } catch (err: any) {
        console.error(`Error en PUT /api/stocks/${stockId || 'ID_DESCONOCIDO'}:`, err.message);
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || "Error al actualizar stock";
        return NextResponse.json({ message }, { status });
    }
}

/**
 * DELETE /api/stocks/[id]
 * Elimina un registro de stock específico.
 */
export async function DELETE(
    req: NextRequest
) {
    const token = req.cookies.get("kustom_token")?.value;
    let stockId: string | undefined;

    if (!token) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    try {
        await jwtVerify<JwtPayload>(token, SECRET_KEY); // Primer await

        // Obtenemos el ID desde la URL
        stockId = getIdFromUrl(req.nextUrl.pathname);
        if (!stockId || isNaN(Number(stockId))) {
            throw new Error("No se pudo leer un ID de stock válido desde la URL.");
        }

        // Llamamos al backend real
        await api.delete(`/stocks/${stockId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return NextResponse.json({ message: "Stock eliminado" }, { status: 200 });

    } catch (err: any) {
        console.error(`Error en DELETE /api/stocks/${stockId || 'ID_DESCONOCIDO'}:`, err.message);
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || "Error al eliminar stock";
        return NextResponse.json({ message }, { status });
    }
}