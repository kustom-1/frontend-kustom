// src/hooks/usePermissions.ts

import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/hooks";
import { permissionsService } from "@/services/permissions.service";
import type { AppPermissions } from "@/lib/definitions";

// El objeto de permisos "por defecto" (ningún permiso)
const defaultPermissions: AppPermissions = {
    canReadUsers: false,
    canCreateUser: false,
    canUpdateUser: false,
    canDeleteUser: false,
    canManageUserRoles: false,
    canReadRoles: false,
    canUpdateRoles: false,
};

/**
 * Hook para obtener los permisos del usuario logueado.
 * Usa React Query para cachear la respuesta.
 */
export const usePermissions = () => {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);

    const { data, isLoading, error } = useQuery({
        queryKey: ["permissions", user?.role], // La query depende del rol
        queryFn: () => permissionsService.getPermissions(),
        enabled: isAuthenticated && !!user, // Solo se ejecuta si el usuario está logueado
        staleTime: 1000 * 60 * 5, // 5 minutos de caché
        refetchOnWindowFocus: false,
    });

    return {
        permissions: data || defaultPermissions,
        isLoading: isLoading,
        error: error,
    };
};