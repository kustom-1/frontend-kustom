// src/app/api/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/lib/api";
import type { JwtPayload, User, CreateUserDto } from "@/lib/definitions";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET no está definida");
}
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

/**
 * GET /api/users
 * Obtiene la lista de todos los usuarios.
 */
export async function GET(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;

    if (!token) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    try {
        // Validar el token (aunque no usemos el payload, valida la sesión)
        await jwtVerify<JwtPayload>(token, SECRET_KEY);

        // Llamar al backend real (Kustom API) con el token
        const response = await api.get<User[]>("/users", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return NextResponse.json(response.data);

    } catch (err: any) {
        console.error("Error en GET /api/users:", err.message);
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || "Error al obtener usuarios";
        return NextResponse.json({ message }, { status });
    }
}

/**
 * POST /api/users
 * Crea un nuevo usuario (usado por el dashboard).
 * Aquí es donde se aplica la regla de "solo Coordinador puede crear Auxiliar"
 */
export async function POST(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;

    if (!token) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    try {
        const { payload } = await jwtVerify<JwtPayload>(token, SECRET_KEY);
        const requesterRole = payload.role;
        const body: CreateUserDto = await req.json();

        // --- REGLA DE NEGOCIO (CONSTRAINT) ---
        // Si el rol a crear NO es Consultor, y el que lo pide NO es Coordinador...
        if (body.role !== "Consultor" && requesterRole !== "Coordinador") {
            return NextResponse.json(
                { message: "No tienes permisos para crear este tipo de usuario" },
                { status: 403 } // Forbidden
            );
        }

        // Si pasa la validación, llamamos al backend real
        const response = await api.post<User>("/users", body, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return NextResponse.json(response.data, { status: 201 });

    } catch (err: any) {
        console.error("Error en POST /api/users:", err.message);
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || "Error al crear usuario";
        return NextResponse.json({ message }, { status });
    }
}