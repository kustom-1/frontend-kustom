// src/services/cloth.service.ts

import { bffApi } from "@/lib/api";
import type { Cloth, CreateClothDto, UpdateClothDto } from "@/lib/definitions";

export const clothService = {
    /**
     * Obtiene la lista de todas las prendas desde nuestro BFF.
     */
    getAll: async (): Promise<Cloth[]> => {
        const { data } = await bffApi.get<Cloth[]>("/cloths");
        return data;
    },

    /**
     * Crea una nueva prenda.
     */
    create: async (clothData: CreateClothDto): Promise<Cloth> => {
        const { data } = await bffApi.post<Cloth>("/cloths", clothData);
        return data;
    },

    /**
     * Actualiza una prenda por ID.
     * (Usamos UpdateClothDto que definimos como Partial<CreateClothDto>)
     */
    update: async (id: number, clothData: UpdateClothDto): Promise<Cloth> => {
        const { data } = await bffApi.put<Cloth>(`/cloths/${id}`, clothData);
        return data;
    },

    /**
     * Elimina una prenda por ID.
     */
    delete: async (id: number): Promise<void> => {
        await bffApi.delete(`/cloths/${id}`);
    },
};