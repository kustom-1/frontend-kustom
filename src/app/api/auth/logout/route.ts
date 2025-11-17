import { NextResponse } from "next/server";

export async function POST() {
    try {
        // 1. Creamos una respuesta
        const response = NextResponse.json({
            success: true,
            message: "Logout exitoso",
        });

        // 2. Seteamos la cookie para que expire en el pasado, borrándola
        response.cookies.set("kustom_token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            path: "/",
            expires: new Date(0), // Expira inmediatamente
        });

        return response;
    } catch (error) {
        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}