// src/app/api/cart-design/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/lib/api";
import type { JwtPayload, CartDesign, CreateCartDesignDto } from "@/lib/definitions";

const JWT_SECRET = process.env.JWT_SECRET!;
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

/**
 * POST /api/cart-design
 * Adds a design (item) to a cart.
 */
export async function POST(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;
    if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    try {
        await jwtVerify(token, SECRET_KEY);
        const body: CreateCartDesignDto = await req.json();

        const response = await api.post<CartDesign>("/cart-design", body, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return NextResponse.json(response.data, { status: 201 });

    } catch (err: any) {
        console.error("Error in POST /api/cart-design:", err.message);
        const status = err.response?.status || 500;
        return NextResponse.json({ message: "Error adding design to cart" }, { status });
    }
}