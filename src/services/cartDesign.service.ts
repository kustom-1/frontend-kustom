// src/services/cartDesign.service.ts

import { bffApi } from "@/lib/api";
import type { CartDesign, CartWithDesignsDto, CreateCartDesignDto, UpdateCartDesignDto } from "@/lib/definitions";

export const cartDesignService = {
    /**
     * Adds a design to a cart (line item).
     */
    addToCart: async (data: CreateCartDesignDto): Promise<CartDesign> => {
        const { data: cartDesign } = await bffApi.post<CartDesign>("/cart-design", data);
        return cartDesign;
    },

    /**
     * Updates the quantity of a design in the cart.
     */
    updateQuantity: async (id: number, quantity: number): Promise<CartDesign> => {
        const data: UpdateCartDesignDto = { quantity };
        const { data: cartDesign } = await bffApi.put<CartDesign>(`/cart-design/${id}`, data);
        return cartDesign;
    },

    /**
   * Retrieves detailed contents of a specific cart.
   */
    getCartDetails: async (cartId: number): Promise<CartWithDesignsDto> => {
        const { data } = await bffApi.get<CartWithDesignsDto>(`/cart-design/cart/${cartId}`);
        return data;
    },

    /**
   * Elimina un ítem (diseño) del carrito.
   */
    delete: async (id: number): Promise<void> => {
        await bffApi.delete(`/cart-design/${id}`);
    },
};