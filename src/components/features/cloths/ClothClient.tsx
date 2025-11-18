// src/components/features/cloths/ClothClient.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { clothService } from "@/services/cloth.service";
import { categoryService } from "@/services/category.service"; // <-- Importar servicio de categorías
import { usePermissions } from "@/hooks/usePermissions";
import type { Cloth, Category } from "@/lib/definitions";
import { createClothColumns } from "./cloth-columns";

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
import { ClothForm } from "./ClothForm"; // <-- Importar el nuevo formulario

export function ClothClient() {
  const queryClient = useQueryClient();
  const {
    permissions,
    isLoading: permsLoading,
    error: permsError,
  } = usePermissions();

  // --- Estado para Modales y Paneles ---
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCloth, setEditingCloth] = useState<Cloth | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingCloth, setDeletingCloth] = useState<Cloth | null>(null);

  // --- QUERIES ---
  // 1. Query para fetchear las PRENDAS
  const {
    data: cloths,
    isLoading: clothsLoading,
    error: clothsError,
  } = useQuery({
    queryKey: ["cloths"],
    queryFn: () => clothService.getAll(),
    enabled: permissions.canReadCloths, // Habilitado por permiso
  });

  // 2. Query para fetchear las CATEGORÍAS (para el formulario)
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
    enabled: permissions.canCreateCloth || permissions.canUpdateCloth, // Solo si puede crear/editar
  });

  // 3. Mutación para Eliminar
  const deleteMutation = useMutation({
    mutationFn: (id: number) => clothService.delete(id),
    onSuccess: () => {
      toast.success("Prenda eliminada exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["cloths"] });
      handleCloseAlert();
    },
    onError: (err: any) => {
      toast.error("Error al eliminar prenda", {
        description: err.response?.data?.message,
      });
    },
  });

  // --- Handlers ---
  const handleCreate = () => {
    setEditingCloth(null);
    setIsSheetOpen(true);
  };
  const handleEdit = (cloth: Cloth) => {
    setEditingCloth(cloth);
    setIsSheetOpen(true);
  };
  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setEditingCloth(null);
  };
  const handleDelete = (cloth: Cloth) => {
    setDeletingCloth(cloth);
    setIsAlertOpen(true);
  };
  const handleCloseAlert = () => {
    setIsAlertOpen(false);
    setDeletingCloth(null);
  };
  const handleDeleteConfirm = () => {
    if (deletingCloth) {
      deleteMutation.mutate(deletingCloth.id);
    }
  };

  // 4. Memoizar las columnas
  const columns = React.useMemo(
    () => createClothColumns(permissions, handleEdit, handleDelete),
    [permissions]
  );

  // 5. Manejar el estado de carga
  const isLoading = clothsLoading || categoriesLoading || permsLoading;
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

  // 6. Manejo de Errores
  const queryError = permsError || clothsError || categoriesError;
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

  // 7. Renderizar la UI final
  return (
    <>
      <div className="w-full space-y-4">
        {/* --- Cabecera --- */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Prendas</h2>
            <p className="text-muted-foreground">
              Gestiona las prendas base para la personalización.
            </p>
          </div>
          {permissions.canCreateCloth && (
            <Button onClick={handleCreate}>
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Prenda
            </Button>
          )}
        </div>

        {/* --- Tabla --- */}
        <DataTable
          columns={columns}
          data={cloths || []}
          filterColumn="name" // <--- NUEVO
          filterPlaceholder="Filtrar por nombre..."
        />
      </div>

      {/* --- Panel Lateral (Sheet) --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto p-4">
          <SheetHeader>
            <SheetTitle>
              {editingCloth ? "Editar Prenda" : "Crear Nueva Prenda"}
            </SheetTitle>
          </SheetHeader>
          <ClothForm
            initialData={editingCloth}
            categories={categories || []} // Pasar las categorías al formulario
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
              la prenda{" "}
              <span className="font-medium">{deletingCloth?.name}</span>.
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
