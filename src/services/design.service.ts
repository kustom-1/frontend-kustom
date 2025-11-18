// src/services/design.service.ts

import { bffApi } from "@/lib/api";
import type { Design, CreateDesignDto } from "@/lib/definitions";

export const designService = {
    /**
     * Obtiene todos los diseños.
     */
    getAll: async (): Promise<Design[]> => {
        const { data } = await bffApi.get<Design[]>("/designs");
        return data;
    },

    /**
     * Obtiene un diseño por ID.
     */
    getOne: async (id: number): Promise<Design> => {
        const { data } = await bffApi.get<Design>(`/designs/${id}`);
        return data;
    },

    /**
     * Crea un nuevo diseño.
     */
    create: async (designData: CreateDesignDto): Promise<Design> => {
        const { data } = await bffApi.post<Design>("/designs", designData);
        return data;
    },

    /**
     * Elimina un diseño.
     */
    delete: async (id: number): Promise<void> => {
        await bffApi.delete(`/designs/${id}`);
    },
};