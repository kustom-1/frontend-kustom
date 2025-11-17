// src/services/stock.service.ts

import { bffApi } from "@/lib/api";
import type { Stock, CreateStockDto, UpdateStockDto } from "@/lib/definitions";

export const stockService = {
    /**
     * Obtiene la lista de todo el inventario desde nuestro BFF.
     */
    getAll: async (): Promise<Stock[]> => {
        const { data } = await bffApi.get<Stock[]>("/stocks");
        return data;
    },

    /**
     * Crea un nuevo registro de stock.
     */
    create: async (stockData: CreateStockDto): Promise<Stock> => {
        const { data } = await bffApi.post<Stock>("/stocks", stockData);
        return data;
    },

    /**
     * Actualiza un registro de stock por ID.
     */
    update: async (id: number, stockData: UpdateStockDto): Promise<Stock> => {
        const { data } = await bffApi.put<Stock>(`/stocks/${id}`, stockData);
        return data;
    },

    /**
     * Elimina un registro de stock por ID.
     */
    delete: async (id: number): Promise<void> => {
        await bffApi.delete(`/stocks/${id}`);
    },
};