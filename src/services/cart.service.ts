// src/services/cart.service.ts

import { bffApi } from "@/lib/api";
import type { Cart, CreateCartDto, UpdateCartDto } from "@/lib/definitions";

export const cartService = {
    /**
     * Retrieves the current active cart for the logged-in user.
     * Calls the BFF which handles user ID injection and active check.
     */
    getActiveCart: async (): Promise<Cart | null> => {
        // We'll create a dedicated BFF route for this to inject the userId from the token
        const { data } = await bffApi.get<Cart | null>("/carts/active");
        return data;
    },

    /**
     * Creates a new cart for the logged-in user (BFF will inject userId).
     */
    createCart: async (): Promise<Cart> => {
        const { data } = await bffApi.post<Cart>("/carts");
        return data;
    },

    /**
     * Updates a cart (e.g., setting isActive to false upon checkout).
     */
    updateCart: async (id: number, updateData: UpdateCartDto): Promise<Cart> => {
        const { data } = await bffApi.put<Cart>(`/carts/${id}`, updateData);
        return data;
    },
};