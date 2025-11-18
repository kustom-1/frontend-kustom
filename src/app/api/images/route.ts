// src/app/api/images/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/lib/api";
import type { JwtPayload, CreateImageDto } from "@/lib/definitions";

const JWT_SECRET = process.env.JWT_SECRET!;
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

export async function POST(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;
    if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    try {
        // 1. Extraer ID de usuario del token
        const { payload } = await jwtVerify<JwtPayload>(token, SECRET_KEY);
        const userId = payload.sub;

        const body = await req.json();

        // 2. Construir el DTO correcto según el OAS
        const imageData: CreateImageDto = {
            url: body.url,
            user: userId, // Inyectado desde el token
            tags: ["custom-upload", "decal"], // Tags por defecto
            isPublic: false, // Privado por defecto para usuarios
        };

        // 3. Llamar al backend real
        const response = await api.post("/images", imageData, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return NextResponse.json(response.data);

    } catch (error: any) {
        console.error("Error registrando imagen:", error);
        const status = error.response?.status || 500;
        return NextResponse.json({ message: "Error al registrar imagen" }, { status });
    }
}