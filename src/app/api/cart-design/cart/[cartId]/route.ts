// src/app/api/cart-design/cart/[cartId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/lib/api";
import type { JwtPayload, CartWithDesignsDto } from "@/lib/definitions";

const JWT_SECRET = process.env.JWT_SECRET!;
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

// Helper para obtener el ID del path
function getIdFromUrl(pathname: string): string | undefined {
    const parts = pathname.split('/');
    return parts[parts.length - 1];
}

/**
 * GET /api/cart-design/cart/[cartId]
 * Retrieves detailed cart contents for the UI.
 */
export async function GET(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;
    let cartId: string | undefined;

    if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    try {
        // 1. Validate token
        await jwtVerify<JwtPayload>(token, SECRET_KEY);

        // 2. Get cartId from URL (using the fix pattern)
        cartId = getIdFromUrl(req.nextUrl.pathname);
        if (!cartId || isNaN(Number(cartId))) {
            throw new Error("ID de carrito inválido.");
        }

        // 3. Proxy to backend
        // OAS route: /cart-design/cart/{cartId}
        const response = await api.get<CartWithDesignsDto>(`/cart-design/cart/${cartId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return NextResponse.json(response.data);

    } catch (err: any) {
        console.error(`Error in GET /api/cart-design/cart/${cartId || '?'}:`, err.message);
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || "Error al obtener detalles del carrito";
        return NextResponse.json({ message }, { status });
    }
}