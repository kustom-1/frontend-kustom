// src/services/rolePermission.service.ts

import { bffApi } from "@/lib/api";
import type {
    RolePermission,
    CreateRolePermissionDto,
    UpdateRolePermissionDto,
    ResourceList,
    ActionList,
    UserRole
} from "@/lib/definitions";

export const rolePermissionService = {
    /**
     * Obtiene la lista de reglas de permisos para un rol específico.
     */
    getPermissionsByRole: async (role: UserRole): Promise<RolePermission[]> => {
        // NOTA: Tu OAS dice que la respuesta de /by-role es { detailedPermissions: [...] }
        // Asumiremos que nuestro BFF en /api/role-permissions/roles/[role] 
        // extrae y devuelve solo el array 'detailedPermissions'.
        const { data } = await bffApi.get<RolePermission[]>(`/role-permissions/roles/${role}`);
        return data;
    },

    /**
     * Obtiene la lista de todos los recursos disponibles (ej: 'users', 'cloths').
     */
    getResources: async (): Promise<ResourceList> => {
        const { data } = await bffApi.get<ResourceList>("/role-permissions/resources");
        return data;
    },

    /**
     * Obtiene la lista de todas las acciones disponibles (ej: 'create', 'read').
     */
    getActions: async (): Promise<ActionList> => {
        const { data } = await bffApi.get<ActionList>("/role-permissions/actions");
        return data;
    },

    /**
     * Crea una nueva regla de permiso.
     */
    create: async (permissionData: CreateRolePermissionDto): Promise<RolePermission> => {
        const { data } = await bffApi.post<RolePermission>("/role-permissions", permissionData);
        return data;
    },

    /**
     * Actualiza una regla de permiso por ID.
     */
    update: async (id: number, permissionData: UpdateRolePermissionDto): Promise<RolePermission> => {
        const { data } = await bffApi.put<RolePermission>(`/role-permissions/${id}`, permissionData);
        return data;
    },

    /**
     * Elimina una regla de permiso por ID.
     */
    delete: async (id: number): Promise<void> => {
        await bffApi.delete(`/role-permissions/${id}`);
    },
};