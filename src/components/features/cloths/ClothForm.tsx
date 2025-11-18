// src/components/features/cloths/ClothForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type {
  Cloth,
  CreateClothDto,
  UpdateClothDto,
  Category,
} from "@/lib/definitions";
import { clothService } from "@/services/cloth.service";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClothFormProps {
  initialData: Cloth | null; // Null = Crear, Objeto = Editar
  categories: Category[]; // Lista de categorías para el desplegable
  onClose: () => void;
}

// El tipo para el formulario
type ClothFormValues = CreateClothDto;

export function ClothForm({
  initialData,
  categories,
  onClose,
}: ClothFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;

  const form = useForm<ClothFormValues>({
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      basePrice: initialData?.basePrice || 0,
      modelUrl: initialData?.modelUrl || "",
      // Convertir el ID numérico a string para el <Select>
      category: initialData?.category
        ? String(initialData.category.id)
        : undefined,
    },
  });

  // Mutación de Creación
  const createMutation = useMutation({
    mutationFn: (data: CreateClothDto) => clothService.create(data),
    onSuccess: () => {
      toast.success("Prenda creada exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["cloths"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error("Error al crear prenda", {
        description: err.response?.data?.message,
      });
    },
  });

  // Mutación de Edición
  const updateMutation = useMutation({
    mutationFn: (data: UpdateClothDto) =>
      clothService.update(initialData!.id, data),
    onSuccess: () => {
      toast.success("Prenda actualizada exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["cloths"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error("Error al actualizar prenda", {
        description: err.response?.data?.message,
      });
    },
  });

  const onSubmit = (values: ClothFormValues) => {
    // Convertir valores numéricos
    const dataToSubmit = {
      ...values,
      basePrice: Number(values.basePrice) || 0,
      category: Number(values.category),
    };

    if (isEditing) {
      updateMutation.mutate(dataToSubmit);
    } else {
      createMutation.mutate(dataToSubmit);
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
              <FormLabel>Nombre de la Prenda</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Camiseta Básica"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Categoría (Desplegable) */}
        <FormField
          control={form.control}
          name="category"
          rules={{ required: "La categoría es requerida." }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={String(field.value)} // Asegurar que sea string
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Precio Base */}
        <FormField
          control={form.control}
          name="basePrice"
          rules={{
            min: { value: 0, message: "El precio no puede ser negativo." },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio Base (en COP)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ej: 30000"
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
                  placeholder="Ej: Camiseta 100% algodón..."
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* URL del Modelo 3D */}
        <FormField
          control={form.control}
          name="modelUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Modelo 3D (Opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://.../modelo.gltf"
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
