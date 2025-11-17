// src/components/features/users/UserClient.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, ShieldAlert } from "lucide-react"; // <-- Importar un ícono de alerta
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { userService } from "@/services/user.service";
import { usePermissions } from "@/hooks/usePermissions";
import { useAppSelector } from "@/lib/hooks";
import type { User, UserRole } from "@/lib/definitions";
import { createColumns } from "./user-columns";
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
import { UserForm } from "./UserForm";

export function UserClient() {
  const queryClient = useQueryClient();

  // Renombramos los props de 'usePermissions' para claridad
  const {
    permissions,
    isLoading: permsLoading,
    error: permsError, // <-- Este es el error 403
  } = usePermissions();

  const currentUserRole = useAppSelector(
    (state) => state.auth.user?.role
  ) as UserRole;

  // --- Estado para Modales y Paneles ---
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // 1. Query para fetchear los datos
  const {
    data: users,
    isLoading: dataLoading,
    error: dataError, // <-- Este es el error de la tabla
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
    enabled: permissions.canReadUsers, // Deshabilitado si canReadUsers es false
  });

  // 2. Mutación para Eliminar
  const deleteMutation = useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: () => {
      toast.success("Usuario eliminado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      handleCloseAlert(); // Cierra el modal de alerta
    },
    onError: (err: any) => {
      toast.error("Error al eliminar usuario", {
        description: err.response?.data?.message,
      });
    },
  });

  // --- Handlers (Manejadores de eventos) ---

  const handleCreate = () => {
    setEditingUser(null); // 'null' significa modo 'Crear'
    setIsSheetOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user); // Pasamos los datos del usuario al formulario
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setEditingUser(null);
  };

  const handleDelete = (user: User) => {
    setDeletingUser(user); // Guarda el usuario que queremos borrar
    setIsAlertOpen(true); // Abre el modal de confirmación
  };

  const handleCloseAlert = () => {
    setIsAlertOpen(false);
    setDeletingUser(null);
  };

  const handleDeleteConfirm = () => {
    if (deletingUser) {
      deleteMutation.mutate(deletingUser.id);
    }
  };

  // 2. Memorizar las columnas
  const columns = React.useMemo(
    () => createColumns(permissions, currentUserRole, handleEdit, handleDelete),
    [permissions, currentUserRole]
  );

  // 3. Manejar el estado de carga
  if (permsError) {
    let title = "Error al cargar permisos";
    let message = "Ocurrió un error al verificar tus permisos.";

    // Verificamos si es un error de Axios con status 403
    if ((permsError as any)?.response?.status === 403) {
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

  // Segundo, revisamos si falló la carga de datos (si tenía permisos pero falló la API de usuarios)
  if (dataError) {
    return (
      <div className="text-center text-destructive">
        Error al cargar usuarios: {dataError.message}
      </div>
    );
  }
  // 4. Renderizar la UI final
  return (
    <>
      <div className="w-full space-y-4">
        {/* --- Cabecera de la Página --- */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
            <p className="text-muted-foreground">
              Gestiona los usuarios de la plataforma.
            </p>
          </div>

          {/* --- Botón de Crear (con RBAC) --- */}
          {permissions.canCreateUser && (
            <Button onClick={handleCreate}>
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Usuario
            </Button>
          )}
        </div>

        {/* --- La Tabla de Datos --- */}
        <DataTable
          columns={columns}
          data={users || []}
          filterColumn="email" // <--- NUEVO
          filterPlaceholder="Filtrar por email..."
        />
      </div>

      {/* --- Panel Lateral (Sheet) para Crear/Editar --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto p-4">
          <SheetHeader>
            <SheetTitle>
              {editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
            </SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <UserForm
              initialData={editingUser}
              canManageRoles={permissions.canManageUserRoles}
              onClose={handleCloseSheet}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* --- Modal (AlertDialog) para Confirmar Borrado --- */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              al usuario{" "}
              <span className="font-medium">{deletingUser?.email}</span>.
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
