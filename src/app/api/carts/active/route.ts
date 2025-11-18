// src/app/api/carts/active/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/lib/api";
import type { JwtPayload, Cart } from "@/lib/definitions";

const JWT_SECRET = process.env.JWT_SECRET!;
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

/**
 * GET /api/carts/active
 * Finds the single active cart for the user, or creates one if needed (as per user request).
 */
export async function GET(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;
    if (!token) return NextResponse.json(null, { status: 200 }); // Not logged in, no cart

    try {
        const { payload } = await jwtVerify<JwtPayload>(token, SECRET_KEY);
        const userId = payload.sub;

        // 1. Check for existing active cart
        // OAS route: /carts/user/{userId}/active
        const response = await api.get<Cart | null>(`/carts/user/${userId}/active`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
            // Found an active cart
            return NextResponse.json(response.data);
        }

        // 2. If no active cart, create a new one (as per user flow)
        const createResponse = await api.post<Cart>("/carts", { user: userId, isActive: true }, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return NextResponse.json(createResponse.data, { status: 201 });

    } catch (err: any) {
        console.error("Error in GET /api/carts/active:", err.message);
        const status = err.response?.status || 500;
        // Return null if unauthorized or internal error during creation attempt
        return NextResponse.json(null, { status: status === 401 ? 200 : 500 });
    }
}