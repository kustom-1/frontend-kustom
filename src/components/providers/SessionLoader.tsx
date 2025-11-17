// src/components/providers/SessionLoader.tsx

"use client";

import React, { useEffect } from "react";
import { authService } from "@/services/auth.service";
import { useAppDispatch } from "@/lib/hooks";
import { setAuthUser, logoutUser } from "@/store/slices/authSlice";
import type { User } from "@/lib/definitions";

/**
 * Este componente se encarga de verificar la sesión del usuario
 * al cargar la aplicación. Llama a /api/auth/me.
 */
export function SessionLoader({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Función asíncrona para verificar la sesión
    const checkUserSession = async () => {
      try {
        // 1. Llama a nuestro BFF (/api/auth/me)
        const user: User = await authService.getMe();

        // 2. Éxito: El token es válido y tenemos datos frescos del usuario
        dispatch(setAuthUser(user));
      } catch (error) {
        // 3. Fracaso: (Error 401, token expirado, etc.)
        // No hay sesión activa, limpiamos el estado.
        console.warn("No active session found.");
        dispatch(logoutUser());
      }
      // Nota: No necesitamos un `finally` para setear loading=false
      // porque tanto `setAuthUser` como `logoutUser` ya lo hacen
      // (según tu archivo authSlice.ts).
    };

    // Ejecutar la verificación solo una vez al montar
    checkUserSession();
  }, [dispatch]);

  return <>{children}</>;
}
