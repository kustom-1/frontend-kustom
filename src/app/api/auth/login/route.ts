// src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { serialize } from "cookie"; // Importamos serialize para manejar cookies
import { decodeJwt } from "jose"; // Importamos decodeJwt de jose
import type {
    AuthUserDto,
    AuthResponse,
    User,
    JwtPayload
} from "@/lib/definitions";

export async function POST(req: NextRequest) {
    try {
        const body: AuthUserDto = await req.json();

        // 1. Llamar al backend real
        const response = await api.post<AuthResponse>("/auth", body);

        const { access_token, user: partialUser } = response.data;

        if (!access_token || !partialUser) {
            return NextResponse.json(
                { message: "Respuesta de backend incompleta" },
                { status: 401 }
            );
        }

        // 2. Decodificar el token para obtener el ID ('sub')
        // Usamos { complete: false } si jwtDecode da problemas, pero por defecto
        // decodifica el payload.
        const payload: JwtPayload = decodeJwt<JwtPayload>(access_token);

        // 3. Construir el objeto User completo
        // Combinamos el ID de 'sub' con el 'user' de la respuesta
        const fullUser: User = {
            id: payload.sub,
            firstName: partialUser.firstName,
            lastName: partialUser.lastName,
            email: partialUser.email,
            role: partialUser.role,
            // 'isActive' no es proporcionado por este endpoint
        };

        // 4. Crear la cookie
        const cookie = serialize("kustom_token", access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24, // 1 día
        });

        // 5. Devolver el objeto User *completo* al cliente
        const responseNext = NextResponse.json(fullUser);
        responseNext.headers.set("Set-Cookie", cookie);

        return responseNext;

    } catch (error: any) {
        if (error.response) {
            return NextResponse.json(
                { message: error.response.data.message || "Credenciales inválidas" },
                { status: error.response.status }
            );
        }
        console.error("Error interno en login/route.ts:", error);
        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}