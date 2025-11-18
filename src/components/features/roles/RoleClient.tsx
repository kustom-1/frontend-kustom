// src/components/features/roles/RoleClient.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { rolePermissionService } from "@/services/rolePermission.service";
import { usePermissions } from "@/hooks/usePermissions";
import {
  RolePermission,
  UserRole,
  ResourceList,
  ActionList,
} from "@/lib/definitions";
import { createRoleColumns } from "./role-columns";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RoleForm } from "./RoleForm";

export function RoleClient() {
  const queryClient = useQueryClient();
  const {
    permissions,
    isLoading: permsLoading,
    error: permsError,
  } = usePermissions();

  const [selectedRole, setSelectedRole] = useState<UserRole>(
    UserRole.Coordinador
  );

  // --- Estado para Modales y Paneles ---
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingPermission, setEditingPermission] =
    useState<RolePermission | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingPermission, setDeletingPermission] =
    useState<RolePermission | null>(null);

  // --- QUERIES ---
  // 1. Query para RECURSOS
  const {
    data: resources,
    isLoading: resourcesLoading,
    error: resourcesError,
  } = useQuery<ResourceList>({
    queryKey: ["resources"],
    queryFn: () => rolePermissionService.getResources(),
    enabled: permissions.canReadRoles,
  });

  // 2. Query para ACCIONES
  const {
    data: actions,
    isLoading: actionsLoading,
    error: actionsError,
  } = useQuery<ActionList>({
    queryKey: ["actions"],
    queryFn: () => rolePermissionService.getActions(),
    enabled: permissions.canReadRoles,
  });

  // 3. Query para los PERMISOS del rol seleccionado
  const {
    data: rolePermissions,
    isLoading: rolePermissionsLoading,
    error: rolePermissionsError,
  } = useQuery<RolePermission[]>({
    queryKey: ["rolePermissions", selectedRole],
    queryFn: () => rolePermissionService.getPermissionsByRole(selectedRole),
    enabled: permissions.canReadRoles && !!selectedRole,
  });

  // 4. Mutación para Eliminar
  const deleteMutation = useMutation({
    mutationFn: (id: number) => rolePermissionService.delete(id),
    onSuccess: () => {
      toast.success("Permiso eliminado exitosamente.");
      queryClient.invalidateQueries({
        queryKey: ["rolePermissions", selectedRole],
      });
      handleCloseAlert();
    },
    onError: (err: any) => {
      toast.error("Error al eliminar permiso", {
        description: err.response?.data?.message,
      });
    },
  });

  // --- Handlers ---
  const handleCreate = () => {
    setEditingPermission(null);
    setIsSheetOpen(true);
  };
  const handleEdit = (permission: RolePermission) => {
    setEditingPermission(permission);
    setIsSheetOpen(true);
  };
  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setEditingPermission(null);
  };
  const handleDelete = (permission: RolePermission) => {
    setDeletingPermission(permission);
    setIsAlertOpen(true);
  };
  const handleCloseAlert = () => {
    setIsAlertOpen(false);
    setDeletingPermission(null);
  };
  const handleDeleteConfirm = () => {
    if (deletingPermission) {
      deleteMutation.mutate(deletingPermission.id);
    }
  };

  // 5. Memoizar las columnas
  const columns = React.useMemo(
    () => createRoleColumns(permissions, handleEdit, handleDelete),
    [permissions]
  );

  // 6. Manejar el estado de carga
  const isLoading =
    permsLoading ||
    resourcesLoading ||
    actionsLoading ||
    rolePermissionsLoading;
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // 7. Manejo de Errores
  const queryError =
    permsError || resourcesError || actionsError || rolePermissionsError;
  if (queryError) {
    let title = "Error al cargar datos";
    let message = "Ocurrió un error al cargar los datos.";
    if ((queryError as any)?.response?.status === 403) {
      title = "Acceso Denegado";
      message =
        "No tienes permisos suficientes para visualizar este contenido.";
    }
    return (
      <div className="flex flex-col items-center justify-center h-64 rounded-md border border-dashed text-center">
        <ShieldAlert className="w-12 h-12 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold text-destructive">{title}</h2>
        <p className="mt-2 text-muted-foreground">{message}</p>
      </div>
    );
  }

  // 8. Renderizar la UI final
  return (
    <>
      <div className="w-full space-y-4">
        {/* --- Cabecera --- */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Roles y Permisos
            </h2>
            <p className="text-muted-foreground">
              Define qué puede hacer cada rol en la plataforma.
            </p>
          </div>
          {permissions.canUpdateRoles && ( // Solo Coordinador
            <Button onClick={handleCreate}>
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Permiso
            </Button>
          )}
        </div>

        {/* --- Selector de Rol (CORREGIDO) --- */}
        <div className="w-full max-w-sm">
          <Select
            onValueChange={(value: UserRole) => setSelectedRole(value)}
            defaultValue={selectedRole}
          >
            {/* <FormControl> <-- SE ELIMINÓ ESTE WRAPPER */}
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un rol para ver sus permisos" />
            </SelectTrigger>
            {/* </FormControl> <-- SE ELIMINÓ ESTE WRAPPER */}
            <SelectContent>
              <SelectItem value="Coordinador">Coordinador</SelectItem>
              <SelectItem value="Auxiliar">Auxiliar</SelectItem>
              <SelectItem value="Consultor">Consultor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* --- Tabla --- */}
        <DataTable
          columns={columns}
          data={rolePermissions || []}
          filterColumn="resource"
          filterPlaceholder="Filtrar por recurso..."
        />
      </div>

      {/* --- Panel Lateral (Sheet) --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingPermission ? "Editar Permiso" : "Crear Nuevo Permiso"}
            </SheetTitle>
          </SheetHeader>
          <RoleForm
            initialData={editingPermission}
            resources={resources || []}
            actions={actions || []}
            selectedRole={selectedRole}
            onClose={handleCloseSheet}
          />
        </SheetContent>
      </Sheet>

      {/* --- Modal (AlertDialog) --- */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la regla de permiso seleccionada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseAlert}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
