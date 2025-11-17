// src/app/api/cloths/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/lib/api";
import type { JwtPayload, Cloth, UpdateClothDto } from "@/lib/definitions";

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
 * PUT /api/cloths/[id]
 * Actualiza una prenda específica.
 */
export async function PUT(
    req: NextRequest
    // { params }: { params: { id: string } } // No usamos params
) {
    const token = req.cookies.get("kustom_token")?.value;
    let clothId: string | undefined;

    if (!token) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    try {
        await jwtVerify<JwtPayload>(token, SECRET_KEY);
        const body: UpdateClothDto = await req.json(); // Primer await

        // Obtenemos el ID desde la URL
        clothId = getIdFromUrl(req.nextUrl.pathname);
        if (!clothId || isNaN(Number(clothId))) {
            throw new Error("No se pudo leer un ID de prenda válido desde la URL.");
        }

        // Llamamos al backend real
        const response = await api.put<Cloth>(`/cloths/${clothId}`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return NextResponse.json(response.data);

    } catch (err: any) {
        console.error(`Error en PUT /api/cloths/${clothId || 'ID_DESCONOCIDO'}:`, err.message);
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || "Error al actualizar prenda";
        return NextResponse.json({ message }, { status });
    }
}

/**
 * DELETE /api/cloths/[id]
 * Elimina una prenda específica.
 */
export async function DELETE(
    req: NextRequest
    // { params }: { params: { id: string } } // No usamos params
) {
    const token = req.cookies.get("kustom_token")?.value;
    let clothId: string | undefined;

    if (!token) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    try {
        await jwtVerify<JwtPayload>(token, SECRET_KEY); // Primer await

        // Obtenemos el ID desde la URL
        clothId = getIdFromUrl(req.nextUrl.pathname);
        if (!clothId || isNaN(Number(clothId))) {
            throw new Error("No se pudo leer un ID de prenda válido desde la URL.");
        }

        // Llamamos al backend real
        await api.delete(`/cloths/${clothId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return NextResponse.json({ message: "Prenda eliminada" }, { status: 200 });

    } catch (err: any) {
        console.error(`Error en DELETE /api/cloths/${clothId || 'ID_DESCONOCIDO'}:`, err.message);
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || "Error al eliminar prenda";
        return NextResponse.json({ message }, { status });
    }
}