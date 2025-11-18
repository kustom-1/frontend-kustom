// src/app/api/cart-design/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/lib/api";
import type { JwtPayload, UpdateCartDesignDto, CartDesign } from "@/lib/definitions";

const JWT_SECRET = process.env.JWT_SECRET!;
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

// Helper para Turbopack
function getIdFromUrl(pathname: string): string | undefined {
    const parts = pathname.split('/');
    return parts[parts.length - 1];
}

/**
 * PUT /api/cart-design/[id]
 * Actualiza la cantidad de un diseño en el carrito.
 */
export async function PUT(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;
    let cartDesignId: string | undefined;

    if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    try {
        await jwtVerify(token, SECRET_KEY);
        const body: UpdateCartDesignDto = await req.json(); // Primer await

        cartDesignId = getIdFromUrl(req.nextUrl.pathname);
        if (!cartDesignId || isNaN(Number(cartDesignId))) {
            throw new Error("ID de ítem inválido.");
        }

        // Proxy al backend real
        const response = await api.put<CartDesign>(`/cart-design/${cartDesignId}`, body, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return NextResponse.json(response.data);

    } catch (err: any) {
        console.error(`Error en PUT /api/cart-design/${cartDesignId}:`, err.message);
        const status = err.response?.status || 500;
        return NextResponse.json({ message: "Error al actualizar cantidad" }, { status });
    }
}

/**
 * DELETE /api/cart-design/[id]
 * Elimina un diseño del carrito.
 */
export async function DELETE(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;
    let cartDesignId: string | undefined;

    if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    try {
        await jwtVerify(token, SECRET_KEY);

        // Fix Turbopack params issue
        const _ = req.nextUrl.pathname;
        await req.text();

        cartDesignId = getIdFromUrl(req.nextUrl.pathname);
        if (!cartDesignId || isNaN(Number(cartDesignId))) {
            throw new Error("ID de ítem inválido.");
        }

        await api.delete(`/cart-design/${cartDesignId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return NextResponse.json({ message: "Ítem eliminado" }, { status: 200 });

    } catch (err: any) {
        console.error(`Error en DELETE /api/cart-design/${cartDesignId}:`, err.message);
        const status = err.response?.status || 500;
        return NextResponse.json({ message: "Error al eliminar ítem" }, { status });
    }
}