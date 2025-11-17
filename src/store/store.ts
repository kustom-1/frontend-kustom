// src/store/store.ts

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
    reducer: {
        // Registramos los reducers que listaste
        auth: authReducer,
        cart: cartReducer,
        theme: themeReducer,
    },
});

// Inferir los tipos `RootState` y `AppDispatch` del propio store
// Estos son los tipos que usaremos en nuestros hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;