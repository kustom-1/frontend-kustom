// src/components/features/categories/CategoryClient.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryService } from "@/services/category.service";
import { usePermissions } from "@/hooks/usePermissions";
import type { Category } from "@/lib/definitions";
import { createCategoryColumns } from "./category-columns";

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
import { CategoryForm } from "./CategoryForm"; // <-- Importar el nuevo formulario

export function CategoryClient() {
  const queryClient = useQueryClient();
  const {
    permissions,
    isLoading: permsLoading,
    error: permsError,
  } = usePermissions();

  // --- Estado para Modales y Paneles ---
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );

  // 1. Query para fetchear los datos
  const {
    data: categories,
    isLoading: dataLoading,
    error: dataError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
    enabled: permissions.canReadCategories, // Habilitado por permiso
  });

  // 2. Mutación para Eliminar
  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryService.delete(id),
    onSuccess: () => {
      toast.success("Categoría eliminada exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      handleCloseAlert();
    },
    onError: (err: any) => {
      toast.error("Error al eliminar categoría", {
        description: err.response?.data?.message,
      });
    },
  });

  // --- Handlers (Manejadores de eventos) ---
  const handleCreate = () => {
    setEditingCategory(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setEditingCategory(null);
  };

  const handleDelete = (category: Category) => {
    setDeletingCategory(category);
    setIsAlertOpen(true);
  };

  const handleCloseAlert = () => {
    setIsAlertOpen(false);
    setDeletingCategory(null);
  };

  const handleDeleteConfirm = () => {
    if (deletingCategory) {
      deleteMutation.mutate(deletingCategory.id);
    }
  };

  // 3. Memoizar las columnas
  const columns = React.useMemo(
    () => createCategoryColumns(permissions, handleEdit, handleDelete),
    [permissions] // Solo depende de los permisos
  );

  // 4. Manejar el estado de carga
  if (dataLoading || permsLoading) {
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

  // 5. Manejo de Errores (incluyendo 403)
  if (permsError) {
    let title = "Error al cargar permisos";
    let message = "Ocurrió un error al verificar tus permisos.";
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
  if (dataError) {
    return (
      <div className="text-center text-destructive">
        Error al cargar categorías: {dataError.message}
      </div>
    );
  }

  // 6. Renderizar la UI final
  return (
    <>
      <div className="w-full space-y-4">
        {/* --- Cabecera de la Página --- */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Categorías</h2>
            <p className="text-muted-foreground">
              Gestiona las categorías de productos.
            </p>
          </div>

          {/* --- Botón de Crear (con RBAC) --- */}
          {permissions.canCreateCategory && (
            <Button onClick={handleCreate}>
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Categoría
            </Button>
          )}
        </div>

        {/* --- La Tabla de Datos --- */}
        <DataTable columns={columns} data={categories || []} />
      </div>

      {/* --- Panel Lateral (Sheet) para Crear/Editar --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto p-4">
          <SheetHeader>
            <SheetTitle>
              {editingCategory ? "Editar Categoría" : "Crear Nueva Categoría"}
            </SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <CategoryForm
              initialData={editingCategory}
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
              la categoría{" "}
              <span className="font-medium">{deletingCategory?.name}</span>.
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
