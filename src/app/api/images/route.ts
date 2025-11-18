// src/app/api/images/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/lib/api";
import type { JwtPayload, CreateImageDto, ImageType } from "@/lib/definitions";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET no está definida");
}
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

/**
 * GET /api/images?tag=...
 */
export async function GET(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");

    if (!token) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    try {
        await jwtVerify<JwtPayload>(token, SECRET_KEY);

        // Construir la URL para el backend real
        const backendUrl = tag ? `/images?tag=${tag}` : "/images";

        const response = await api.get<ImageType[]>(backendUrl, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return NextResponse.json(response.data);

    } catch (err: any) {
        console.error("Error en GET /api/images:", err.message);
        const status = err.response?.status || 500;
        return NextResponse.json({ message: "Error al obtener imágenes" }, { status });
    }
}

/**
 * POST /api/images
 * Registra una nueva imagen (usado por el ImageService tras subir a S3).
 */
export async function POST(req: NextRequest) {
    const token = req.cookies.get("kustom_token")?.value;
    if (!token) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    try {
        // 1. Extraer ID de usuario del token
        const { payload } = await jwtVerify<JwtPayload>(token, SECRET_KEY);
        const userId = payload.sub;

        // 2. Obtener body (url, tags, isPublic)
        const body = await req.json();

        // 3. Construir el DTO asegurando que el usuario sea el del token
        const imageData: CreateImageDto = {
            url: body.url,
            user: userId, // Inyectado desde el token
            tags: body.tags || ["upload"],
            isPublic: body.isPublic ?? false,
        };

        // 4. Llamar al backend real
        const response = await api.post<ImageType>("/images", imageData, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return NextResponse.json(response.data, { status: 201 });

    } catch (error: any) {
        console.error("Error en POST /api/images:", error.message);
        const status = error.response?.status || 500;
        return NextResponse.json({ message: "Error al registrar imagen" }, { status });
    }
}