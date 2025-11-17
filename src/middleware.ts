// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import type { JwtPayload } from "@/lib/definitions"; // <-- Importar el tipo

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET no está definida en .env.local");
}

const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get("kustom_token")?.value;

    // 1. Proteger todas las rutas del dashboard
    if (pathname.startsWith("/dashboard")) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        try {
            // Usamos el tipo JwtPayload
            const { payload } = await jwtVerify<JwtPayload>(token, SECRET_KEY);
            const userRole = payload.role; // Ya es de tipo UserRole

            // 2. Lógica de Permisos Específica
            if (userRole === "Consultor" && pathname.startsWith("/dashboard/users")) {
                return NextResponse.redirect(new URL("/dashboard", req.url));
            }

            if (userRole === "Auxiliar" && pathname.includes("/edit")) {
                return NextResponse.redirect(new URL("/dashboard/users", req.url));
            }

            return NextResponse.next();

        } catch (err) {
            console.error("Error de token en Middleware:", err);
            const response = NextResponse.redirect(new URL("/login", req.url));
            response.cookies.delete("kustom_token");
            return response;
        }
    }

    // Si está autenticado y va a /login o /register...
    if (token && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
        try {
            await jwtVerify(token, SECRET_KEY); // Solo validar
            return NextResponse.redirect(new URL("/dashboard", req.url));
        } catch (e) {
            // Token malo, dejarlo continuar
        }
    }

    return NextResponse.next();
}

// Configuración del Matcher
export const config = {
    matcher: [
        "/dashboard/:path*",
        "/login",
        "/register",
    ],
};