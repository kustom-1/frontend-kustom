import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Definiremos 'CartItem' en definitions.ts más adelante
type CartState = {
    items: any[]; // Usamos 'any' por ahora
    total: number;
};

const initialState: CartState = {
    items: [],
    total: 0,
};

export const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        // Lo llenaremos en la Fase 3
    },
});

// export const { } = cartSlice.actions;
export default cartSlice.reducer;