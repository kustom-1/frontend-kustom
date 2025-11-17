// src/services/category.service.ts

import { bffApi } from "@/lib/api";
import type { Category, CreateCategoryDto } from "@/lib/definitions";

export const categoryService = {
    /**
     * Obtiene la lista de todas las categorías desde nuestro BFF.
     */
    getAll: async (): Promise<Category[]> => {
        const { data } = await bffApi.get<Category[]>("/categories");
        return data;
    },

    /**
     * Crea una nueva categoría.
     */
    create: async (categoryData: CreateCategoryDto): Promise<Category> => {
        const { data } = await bffApi.post<Category>("/categories", categoryData);
        return data;
    },

    /**
     * Actualiza una categoría por ID.
     */
    update: async (id: number, categoryData: Partial<CreateCategoryDto>): Promise<Category> => {
        const { data } = await bffApi.put<Category>(`/categories/${id}`, categoryData);
        return data;
    },

    /**
     * Elimina una categoría por ID.
     */
    delete: async (id: number): Promise<void> => {
        await bffApi.delete(`/categories/${id}`);
    },
};