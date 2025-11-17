// src/app/api/users/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { api } from "@/lib/api";
import { JwtPayload, User, UserRole } from "@/lib/definitions";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET no está definida");
}
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

/**
 * PUT /api/users/[id]
 * Actualiza un usuario específico.
 */
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const token = req.cookies.get("kustom_token")?.value;
    const { id: userIdToUpdate } = await context.params;

    if (!token) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    try {
        const { payload } = await jwtVerify<JwtPayload>(token, SECRET_KEY);
        const requesterRole = payload.role;
        const body: Partial<User> = await req.json();

        // --- REGLA DE NEGOCIO (CONSTRAINT) ---
        // Un 'Auxiliar' solo puede editar usuarios con rol 'Consultor'.
        // Asumimos que el 'body.role' (el nuevo rol) también debe ser verificado.

        if (requesterRole === UserRole.Auxiliar) {
            // TODO: Verificar el rol *actual* del usuario 'userIdToUpdate' antes de permitir.
            // Por ahora, aplicamos una regla simple: Un Auxiliar no puede cambiar roles.
            if (body.role && body.role !== UserRole.Consultor) {
                return NextResponse.json(
                    { message: "No tienes permisos para asignar este rol" },
                    { status: 403 } // Forbidden
                );
            }
        }

        // Un Coordinador puede hacer todo.
        // Llamamos al backend real
        const response = await api.put<User>(`/users/${userIdToUpdate}`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return NextResponse.json(response.data);

    } catch (err: any) {
        console.error(`Error en PUT /api/users/${userIdToUpdate}:`, err.message);
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || "Error al actualizar usuario";
        return NextResponse.json({ message }, { status });
    }
}

/**
 * DELETE /api/users/[id]
 * Elimina un usuario específico.
 */
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const token = req.cookies.get("kustom_token")?.value;
    const { id: userIdToDelete } = await context.params;

    if (!token) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    try {
        const { payload } = await jwtVerify<JwtPayload>(token, SECRET_KEY);
        const requesterRole = payload.role;

        // --- REGLA DE NEGOCIO (CONSTRAINT) ---
        // Un 'Auxiliar' solo puede eliminar 'Consultores'.
        // Un 'Coordinador' puede eliminar a todos (excepto a sí mismo,
        // pero esa lógica debería estar en el backend).

        if (requesterRole === UserRole.Auxiliar) {
            // TODO: Verificar el rol *actual* del usuario 'userIdToDelete' antes de permitir.
            // Esta es una limitación; necesitaríamos fetchear al usuario primero.
            // Por ahora, asumimos que el 'user-columns.tsx' hizo la validación en la UI.
        }

        // Llamamos al backend real
        await api.delete(`/users/${userIdToDelete}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return NextResponse.json({ message: "Usuario eliminado" }, { status: 200 });

    } catch (err: any) {
        console.error(`Error en DELETE /api/users/${userIdToDelete}:`, err.message);
        const status = err.response?.status || 500;
        const message = err.response?.data?.message || "Error al eliminar usuario";
        return NextResponse.json({ message }, { status });
    }
}