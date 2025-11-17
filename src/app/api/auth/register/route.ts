// src/app/api/auth/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api"; // <-- Importamos la instancia de servidor
import type { CreateUserDto, User } from "@/lib/definitions";

export async function POST(req: NextRequest) {
    try {
        const body: CreateUserDto = await req.json();

        // 1. Llamamos al backend *real* usando nuestra instancia centralizada
        // El OAS indica que para crear un usuario (Consultor) se llama a POST /users
        const response = await api.post<User>(
            "/users", // Endpoint de creación de usuario
            body
        );

        // 2. Obtenemos el usuario recién creado
        const newUser = response.data;

        if (!newUser) {
            return NextResponse.json(
                { message: "El backend no devolvió un usuario" },
                { status: 500 } // Error del servidor
            );
        }

        // 3. Devolvemos el nuevo usuario al RegisterForm.
        // Nota: NO seteamos una cookie. El flujo de UX
        // es que el usuario se registre y *luego* inicie sesión.
        return NextResponse.json(newUser, { status: 201 });

    } catch (error: any) {
        // Manejo de errores
        if (error.response) {
            // Error de Axios (backend Kustom)
            // Esto es crucial para manejar el "409 Conflict - Email already exists"
            return NextResponse.json(
                { message: error.response.data.message || "Error al registrar" },
                { status: error.response.status }
            );
        }

        // Error genérico
        console.error("Error interno en register/route.ts:", error);
        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}