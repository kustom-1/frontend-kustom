import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ThemeState = {
    theme: "light" | "dark" | "system";
};

const initialState: ThemeState = {
    theme: "system",
};

export const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => {
            state.theme = action.payload;
        },
    },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;