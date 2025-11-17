// src/lib/api.ts

import axios from "axios";
import type { AxiosInstance } from "axios";

/**
 * Cliente de API para ser usado en Componentes de Cliente ("use client").
 * 1. Esta instancia llama a nuestras propias API Routes (BFF) en `/api/...`.
 * 2. Es la forma segura de interactuar con el backend desde el navegador.
 */
export const bffApi: AxiosInstance = axios.create({
    baseURL: "/api", // Apunta a nuestras API routes de Next.js
    headers: {
        'Content-Type': 'application/json',
    },
});

bffApi.interceptors.response.use(
    (response) => response,
    (error) => {
        // Aquí podemos disparar "sonner" para errores del cliente
        console.error("Error en llamada al BFF:", error);
        return Promise.reject(error);
    }
);


/**
 * Cliente de API para ser usado en el LADO DEL SERVIDOR (Route Handlers, Server Actions).
 * 1. Esta instancia llama DIRECTAMENTE al backend externo (Kustom API).
 * 2. NUNCA debe ser importada en un componente "use client".
 */
export const api: AxiosInstance = axios.create({
    baseURL: process.env.BACKEND_API_URL, // Usamos la variable de .env.local
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Manejo de errores centralizado para llamadas al backend real
        console.error("Error en llamada al Kustom API:", error);
        return Promise.reject(error);
    }
);