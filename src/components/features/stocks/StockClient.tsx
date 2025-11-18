// src/components/features/stocks/StockClient.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { stockService } from "@/services/stock.service";
import { clothService } from "@/services/cloth.service";
import { categoryService } from "@/services/category.service";
import { usePermissions } from "@/hooks/usePermissions";
import type { Stock, Cloth, Category } from "@/lib/definitions";
import { createStockColumns } from "./stock-columns";

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
import { StockForm } from "./StockForm"; // <-- Importar el nuevo formulario

export function StockClient() {
  const queryClient = useQueryClient();
  const {
    permissions,
    isLoading: permsLoading,
    error: permsError,
  } = usePermissions();

  // --- Estado para Modales y Paneles ---
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingStock, setDeletingStock] = useState<Stock | null>(null);

  // --- QUERIES ---
  // 1. Query para fetchear el INVENTARIO
  const {
    data: stocks,
    isLoading: stocksLoading,
    error: stocksError,
  } = useQuery({
    queryKey: ["stocks"],
    queryFn: () => stockService.getAll(),
    enabled: permissions.canReadStocks,
  });

  // 2. Query para fetchear las PRENDAS (para el formulario)
  const {
    data: cloths,
    isLoading: clothsLoading,
    error: clothsError,
  } = useQuery({
    queryKey: ["cloths"],
    queryFn: () => clothService.getAll(),
    enabled: permissions.canCreateStock || permissions.canUpdateStock,
  });

  // 3. Query para fetchear las CATEGORÍAS (para el formulario)
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
    enabled: permissions.canCreateStock || permissions.canUpdateStock,
  });

  // 4. Mutación para Eliminar
  const deleteMutation = useMutation({
    mutationFn: (id: number) => stockService.delete(id),
    onSuccess: () => {
      toast.success("Stock eliminado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      handleCloseAlert();
    },
    onError: (err: any) => {
      toast.error("Error al eliminar stock", {
        description: err.response?.data?.message,
      });
    },
  });

  // --- Handlers ---
  const handleCreate = () => {
    setEditingStock(null);
    setIsSheetOpen(true);
  };
  const handleEdit = (stock: Stock) => {
    setEditingStock(stock);
    setIsSheetOpen(true);
  };
  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setEditingStock(null);
  };
  const handleDelete = (stock: Stock) => {
    setDeletingStock(stock);
    setIsAlertOpen(true);
  };
  const handleCloseAlert = () => {
    setIsAlertOpen(false);
    setDeletingStock(null);
  };
  const handleDeleteConfirm = () => {
    if (deletingStock) {
      deleteMutation.mutate(deletingStock.id);
    }
  };

  // 5. Memoizar las columnas
  const columns = React.useMemo(
    () => createStockColumns(permissions, handleEdit, handleDelete),
    [permissions]
  );

  // 6. Manejar el estado de carga
  const isLoading =
    stocksLoading || clothsLoading || categoriesLoading || permsLoading;
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
    permsError || stocksError || clothsError || categoriesError;
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
              Inventario (Stock)
            </h2>
            <p className="text-muted-foreground">
              Gestiona las variantes (talla, color) de cada prenda.
            </p>
          </div>
          {permissions.canCreateStock && (
            <Button onClick={handleCreate}>
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Stock
            </Button>
          )}
        </div>

        {/* --- Tabla --- */}
        <DataTable
          columns={columns}
          data={stocks || []}
          filterColumn="cloth" // <-- Filtraremos por el nombre de la prenda
          filterPlaceholder="Filtrar por prenda..."
        />
      </div>

      {/* --- Panel Lateral (Sheet) --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingStock ? "Editar Stock" : "Crear Nuevo Stock"}
            </SheetTitle>
          </SheetHeader>
          {/* Aplicamos tu padding p-4 si es necesario, o dejamos el default */}
          <StockForm
            initialData={editingStock}
            cloths={cloths || []}
            categories={categories || []}
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
              el registro de stock seleccionado.
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
