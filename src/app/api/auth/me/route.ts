// src/app/api/auth/me/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/lib/api"; // <-- Importamos la instancia de servidor
import type { User, JwtPayload } from "@/lib/definitions";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("JWT_SECRET no está definida en .env.local");
    throw new Error("Configuración de servidor incompleta: JWT_SECRET");
}

const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

export async function GET(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;

    if (!token) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    try {
        // 1. Verificar el token y extraer el 'sub' (ID de usuario)
        const { payload } = await jwtVerify<JwtPayload>(token, SECRET_KEY);
        const userId = payload.sub;

        if (!userId) {
            throw new Error("Payload de JWT inválido, 'sub' no encontrado.");
        }

        // 2. Llamar al backend real para obtener los datos frescos del usuario
        // Tu OAS indica que GET /users/{id} es público (sin auth)
        // Usamos la instancia 'api' que llama a process.env.BACKEND_API_URL
        const response = await api.get<User>(`/users/${userId}`);

        const user = response.data;

        if (!user) {
            throw new Error("Usuario no encontrado en el backend");
        }

        // 3. Devolver los datos completos del usuario
        return NextResponse.json(user);

    } catch (err: any) {
        console.error("Error en /api/auth/me:", err.message);

        // Si el token es inválido (expirado, etc.) o el usuario no se encuentra
        const response = NextResponse.json(
            { message: "No autorizado: Token inválido o sesión expirada" },
            { status: 401 }
        );
        response.cookies.delete("kustom_token"); // Limpiar cookie
        return response;
    }
}