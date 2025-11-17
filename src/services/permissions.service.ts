// src/services/permissions.service.ts

import { bffApi } from "@/lib/api";
import type { AppPermissions } from "@/lib/definitions";

/**
 * Este servicio llama a nuestro BFF para obtener el objeto
 * de permisos procesado para el usuario actual.
 */
export const permissionsService = {
    getPermissions: async (): Promise<AppPermissions> => {
        // Llama al nuevo endpoint BFF que crearemos
        const { data } = await bffApi.get<AppPermissions>("/permissions");
        return data;
    },
};