// src/app/api/categories/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/lib/api";
import type { JwtPayload, Category, CreateCategoryDto } from "@/lib/definitions";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET no está definida");
}
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

// --- FUNCIÓN HELPER ---
function getIdFromUrl(pathname: string): string | undefined {
    const parts = pathname.split('/');
    return parts[parts.length - 1];
}

/**
 * PUT /api/categories/[id]
 */
export async function PUT(
    req: NextRequest
    // { params }: { params: { id: string } } // <-- Eliminamos params
) {
    const token = req.cookies.get("kustom_token")?.value;
    let categoryId: string | undefined; // Declarar ID aquí

    if (!token) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    try {
        await jwtVerify<JwtPayload>(token, SECRET_KEY);
        const body: Partial<CreateCategoryDto> = await req.json(); // Primer await

        // --- CORRECCIÓN ---
        // Obtenemos el ID desde la URL
        categoryId = getIdFromUrl(req.nextUrl.pathname);
        if (!categoryId || isNaN(Number(categoryId))) {
            throw new Error("No se pudo leer un ID de categoría válido desde la URL.");
        }
        // --- FIN CORRECCIÓN ---

        const response = await api.put<Category>(`/categories/${categoryId}`, body, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return NextResponse.json(response.data);

    } catch (err: any) {
        console.error(`Error en PUT /api/categories/${categoryId || 'ID_DESCONOCIDO'}:`, err.message);
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || "Error al actualizar categoría";
        return NextResponse.json({ message }, { status });
    }
}

/**
 * DELETE /api/categories/[id]
 */
export async function DELETE(
    req: NextRequest
    // { params }: { params: { id: string } } // <-- Eliminamos params
) {
    const token = req.cookies.get("kustom_token")?.value;
    let categoryId: string | undefined; // Declarar ID aquí

    if (!token) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    try {
        await jwtVerify<JwtPayload>(token, SECRET_KEY); // Primer await

        // --- CORRECCIÓN ---
        // Obtenemos el ID desde la URL
        categoryId = getIdFromUrl(req.nextUrl.pathname);
        if (!categoryId || isNaN(Number(categoryId))) {
            throw new Error("No se pudo leer un ID de categoría válido desde la URL.");
        }
        // --- FIN CORRECCIÓN ---

        await api.delete(`/categories/${categoryId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return NextResponse.json({ message: "Categoría eliminada" }, { status: 200 });

    } catch (err: any) {
        console.error(`Error en DELETE /api/categories/${categoryId || 'ID_DESCONOCIDO'}:`, err.message);
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || "Error al eliminar categoría";
        return NextResponse.json({ message }, { status });
    }
}