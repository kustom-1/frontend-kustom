// src/components/features/categories/CategoryForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Category, CreateCategoryDto } from "@/lib/definitions";
import { categoryService } from "@/services/category.service";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Usaremos Textarea para la descripción

interface CategoryFormProps {
  initialData: Category | null; // Null = Crear, Objeto = Editar
  onClose: () => void;
}

// El tipo para el formulario
type CategoryFormValues = CreateCategoryDto;

export function CategoryForm({ initialData, onClose }: CategoryFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;

  const form = useForm<CategoryFormValues>({
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  // Mutación de Creación
  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryDto) => categoryService.create(data),
    onSuccess: () => {
      toast.success("Categoría creada exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error("Error al crear categoría", {
        description: err.response?.data?.message,
      });
    },
  });

  // Mutación de Edición
  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateCategoryDto>) =>
      categoryService.update(initialData!.id, data),
    onSuccess: () => {
      toast.success("Categoría actualizada exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error("Error al actualizar categoría", {
        description: err.response?.data?.message,
      });
    },
  });

  const onSubmit = (values: CategoryFormValues) => {
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Nombre */}
        <FormField
          control={form.control}
          name="name"
          rules={{ required: "El nombre es requerido." }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Camisetas"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descripción */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej: Categoría para todo tipo de camisetas"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
