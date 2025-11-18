// src/app/api/images/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/lib/api";
import type { JwtPayload, ImageType, UpdateImageDto } from "@/lib/definitions";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET no está definida");
}
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

// --- Helper para evitar bug de params en Turbopack ---
function getIdFromUrl(pathname: string): string | undefined {
    const parts = pathname.split('/');
    return parts[parts.length - 1];
}

/**
 * GET /api/images/[id]
 * Obtiene una imagen específica.
 */
export async function GET(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;
    let imageId: string | undefined;

    if (!token) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    try {
        await jwtVerify<JwtPayload>(token, SECRET_KEY);
        imageId = getIdFromUrl(req.nextUrl.pathname);

        if (!imageId || isNaN(Number(imageId))) {
            throw new Error("ID inválido en URL");
        }

        const response = await api.get<ImageType>(`/images/${imageId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return NextResponse.json(response.data);

    } catch (err: any) {
        console.error(`Error en GET /api/images/${imageId || '?'}:`, err.message);
        const status = err.response?.status || 500;
        return NextResponse.json({ message: "Error al obtener imagen" }, { status });
    }
}

/**
 * PUT /api/images/[id]
 * Actualiza una imagen (ej: cambiar tags o visibilidad).
 */
export async function PUT(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;
    let imageId: string | undefined;

    if (!token) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    try {
        await jwtVerify<JwtPayload>(token, SECRET_KEY);
        const body: UpdateImageDto = await req.json(); // Primer await

        imageId = getIdFromUrl(req.nextUrl.pathname);
        if (!imageId || isNaN(Number(imageId))) {
            throw new Error("ID inválido en URL");
        }

        const response = await api.put<ImageType>(`/images/${imageId}`, body, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return NextResponse.json(response.data);

    } catch (err: any) {
        console.error(`Error en PUT /api/images/${imageId || '?'}:`, err.message);
        const status = err.response?.status || 500;
        return NextResponse.json({ message: "Error al actualizar imagen" }, { status });
    }
}

/**
 * DELETE /api/images/[id]
 * Elimina una imagen (solo de BD, no de S3 por ahora).
 */
export async function DELETE(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;
    let imageId: string | undefined;

    if (!token) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    try {
        await jwtVerify<JwtPayload>(token, SECRET_KEY);

        // Forzar consumo del stream (solución bug Turbopack)
        const _ = req.nextUrl.pathname;
        await req.text();

        imageId = getIdFromUrl(req.nextUrl.pathname);
        if (!imageId || isNaN(Number(imageId))) {
            throw new Error("ID inválido en URL");
        }

        await api.delete(`/images/${imageId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return NextResponse.json({ message: "Imagen eliminada" }, { status: 200 });

    } catch (err: any) {
        console.error(`Error en DELETE /api/images/${imageId || '?'}:`, err.message);
        const status = err.response?.status || 500;
        return NextResponse.json({ message: "Error al eliminar imagen" }, { status });
    }
}