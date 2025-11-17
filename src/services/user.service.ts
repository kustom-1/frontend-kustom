// src/services/user.service.ts

import { bffApi } from "@/lib/api";
import type { User, CreateUserDto } from "@/lib/definitions";

export const userService = {
    /**
     * Obtiene la lista de todos los usuarios desde nuestro BFF.
     */
    getAll: async (): Promise<User[]> => {
        const { data } = await bffApi.get<User[]>("/users");
        return data;
    },

    /**
     * Crea un nuevo usuario.
     * (Esta la usará nuestro formulario de "Crear Usuario" en el dashboard)
     */
    create: async (userData: CreateUserDto): Promise<User> => {
        const { data } = await bffApi.post<User>("/users", userData);
        return data;
    },

    /**
     * Actualiza un usuario por ID.
     */
    update: async (id: number, userData: Partial<User>): Promise<User> => {
        const { data } = await bffApi.put<User>(`/users/${id}`, userData);
        return data;
    },

    /**
     * Elimina un usuario por ID.
     */
    delete: async (id: number): Promise<void> => {
        await bffApi.delete(`/users/${id}`);
    },
};