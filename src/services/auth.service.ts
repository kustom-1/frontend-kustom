// src/services/auth.service.ts

import { bffApi } from "@/lib/api"; // <-- Importamos la instancia centralizada
import type { AuthUserDto, CreateUserDto, User } from "@/lib/definitions";

export const authService = {
    /**
     * Llama a nuestro BFF para loguear al usuario y setear la cookie
     */
    login: async (credentials: AuthUserDto) => {
        const { data } = await bffApi.post("/auth/login", credentials);
        return data;
    },

    /**
     * Llama a nuestro BFF para registrar al usuario
     */
    register: async (userData: CreateUserDto) => {
        const { data } = await bffApi.post("/auth/register", userData);
        return data;
    },

    /**
     * Llama a nuestro BFF para borrar la cookie
     */
    logout: async () => {
        const { data } = await bffApi.post("/auth/logout");
        return data;
    },

    /**
     * Llama al BFF para obtener el perfil del usuario autenticado
     * usando la cookie httpOnly.
     */
    getMe: async (): Promise<User> => {
        const { data } = await bffApi.get<User>("/auth/me");
        return data;
    }
};