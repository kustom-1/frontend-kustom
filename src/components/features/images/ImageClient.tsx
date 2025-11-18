// src/components/features/images/ImageClient.tsx

"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
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

import { imageService } from "@/services/image.service";
import type { ImageType } from "@/lib/definitions";
import { createImageColumns } from "./image-columns";
import { ImageForm } from "./ImageForm";

export function ImageClient() {
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingImage, setDeletingImage] = useState<ImageType | null>(null);

  // 1. Get Images
  const {
    data: images,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["images"],
    queryFn: () => imageService.getAll(),
  });

  // 2. Delete Image
  const deleteMutation = useMutation({
    mutationFn: (id: number) => imageService.delete(id),
    onSuccess: () => {
      toast.success("Imagen eliminada.");
      queryClient.invalidateQueries({ queryKey: ["images"] });
      setIsAlertOpen(false);
    },
    onError: () => toast.error("Error al eliminar imagen."),
  });

  // Handlers
  const handleDeleteRequest = (img: ImageType) => {
    setDeletingImage(img);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (deletingImage) deleteMutation.mutate(deletingImage.id);
  };

  const columns = useMemo(() => createImageColumns(handleDeleteRequest), []);

  if (isLoading) return <Skeleton className="h-[400px] w-full" />;
  if (error) return <div>Error cargando imágenes</div>;

  return (
    <>
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Galería de Archivos
            </h2>
            <p className="text-muted-foreground">
              Gestiona modelos 3D (.glb) e imágenes para texturas.
            </p>
          </div>
          <Button onClick={() => setIsSheetOpen(true)}>
            <UploadCloud className="mr-2 h-4 w-4" /> Subir Archivo
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={images || []}
          filterColumn="tags" // Ojo: nuestro filtro es simple por string, tags es array.
          // Quizás filtrar por URL o implementar un filtro custom después.
          filterPlaceholder="Filtrar..."
        />
      </div>

      {/* Sheet de Carga */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto p-4">
          <SheetHeader>
            <SheetTitle>Subir Nuevo Archivo</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ImageForm onClose={() => setIsSheetOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Alert Delete */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el registro de la base de datos. (Nota: El
              archivo en S3 no se borra automáticamente por seguridad).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
