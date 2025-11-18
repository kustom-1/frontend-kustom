// src/app/api/carts/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/lib/api";
import type { JwtPayload, Cart, UpdateCartDto } from "@/lib/definitions";

const JWT_SECRET = process.env.JWT_SECRET!;
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

// Helper para Turbopack
function getIdFromUrl(pathname: string): string | undefined {
    const parts = pathname.split('/');
    return parts[parts.length - 1];
}

/**
 * PUT /api/carts/[id]
 * Actualiza un carrito (ej: cambiar isActive a false).
 */
export async function PUT(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;
    let cartId: string | undefined;

    if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    try {
        await jwtVerify(token, SECRET_KEY);
        const body: UpdateCartDto = await req.json(); // Primer await

        cartId = getIdFromUrl(req.nextUrl.pathname);
        if (!cartId || isNaN(Number(cartId))) {
            throw new Error("ID de carrito inválido.");
        }

        // Proxy al backend real
        const response = await api.put<Cart>(`/carts/${cartId}`, body, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return NextResponse.json(response.data);

    } catch (err: any) {
        console.error(`Error en PUT /api/carts/${cartId || '?'}:`, err.message);
        const status = err.response?.status || 500;
        return NextResponse.json({ message: "Error al actualizar carrito" }, { status });
    }
}

/**
 * DELETE /api/carts/[id]
 * Elimina un carrito.
 */
export async function DELETE(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;
    let cartId: string | undefined;

    if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    try {
        await jwtVerify(token, SECRET_KEY);

        // Fix Turbopack stream issue
        const _ = req.nextUrl.pathname;
        await req.text();

        cartId = getIdFromUrl(req.nextUrl.pathname);
        if (!cartId || isNaN(Number(cartId))) {
            throw new Error("ID de carrito inválido.");
        }

        await api.delete(`/carts/${cartId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return NextResponse.json({ message: "Carrito eliminado" }, { status: 200 });

    } catch (err: any) {
        console.error(`Error en DELETE /api/carts/${cartId || '?'}:`, err.message);
        const status = err.response?.status || 500;
        return NextResponse.json({ message: "Error al eliminar carrito" }, { status });
    }
}