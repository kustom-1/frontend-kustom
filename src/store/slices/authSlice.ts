// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/lib/definitions";

type AuthState = {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
};

const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    loading: true, // Empezamos en true para verificar la sesión
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuthLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setAuthUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
            state.loading = false;
        },
        logoutUser: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
        },
    },
});

export const { setAuthLoading, setAuthUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;