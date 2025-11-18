// src/components/features/stocks/StockForm.tsx

"use client";

import React, { useState } from "react"; // Importar useState
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Stock, CreateStockDto, Cloth, Category } from "@/lib/definitions";
import { stockService } from "@/services/stock.service";
import { SIZES, COLORS, GENDERS } from "@/lib/constants";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StockFormProps {
  initialData: Stock | null; // Null = Crear, Objeto = Editar
  cloths: Cloth[]; // Lista de prendas para el desplegable
  categories: Category[]; // Lista de categorías para filtrar
  onClose: () => void;
}

// El tipo para el formulario
type StockFormValues = Omit<CreateStockDto, "cloth" | "stock"> & {
  cloth: string; // El 'select' de HTML maneja strings
  stock: string; // El 'input' de número maneja strings
};

export function StockForm({
  initialData,
  cloths,
  categories,
  onClose,
}: StockFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;

  // Estado para el filtro de categoría
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    isEditing ? String(initialData.cloth.category.id) : undefined
  );

  const form = useForm<StockFormValues>({
    defaultValues: {
      cloth: initialData?.cloth ? String(initialData.cloth.id) : undefined,
      stock: initialData?.stock ? String(initialData.stock) : "0",
      gender: initialData?.gender || undefined,
      color: initialData?.color || undefined,
      size: initialData?.size || undefined,
    },
  });

  // Filtrar prendas basadas en la categoría seleccionada
  const filteredCloths = selectedCategory
    ? cloths.filter((cloth) => String(cloth.category.id) === selectedCategory)
    : cloths;

  // --- Mutaciones ---
  const createMutation = useMutation({
    mutationFn: (data: CreateStockDto) => stockService.create(data),
    onSuccess: () => {
      toast.success("Stock creado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error("Error al crear stock", {
        description: err.response?.data?.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateStockDto) =>
      stockService.update(initialData!.id, data),
    onSuccess: () => {
      toast.success("Stock actualizado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error("Error al actualizar stock", {
        description: err.response?.data?.message,
      });
    },
  });

  const onSubmit = (values: StockFormValues) => {
    // Convertir los valores de string a número
    const dataToSubmit: CreateStockDto = {
      ...values,
      stock: Number(values.stock),
      cloth: Number(values.cloth),
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
        {/* Filtro de Categoría (solo UI, no se envía) */}
        <FormItem>
          <FormLabel>Filtrar por Categoría</FormLabel>
          <Select
            onValueChange={setSelectedCategory}
            defaultValue={selectedCategory}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría para filtrar prendas" />
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
        </FormItem>

        {/* Prenda (Desplegable) */}
        <FormField
          control={form.control}
          name="cloth"
          rules={{ required: "La prenda es requerida." }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prenda</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading || !selectedCategory}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una prenda" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredCloths.map((cloth) => (
                    <SelectItem key={cloth.id} value={String(cloth.id)}>
                      {cloth.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cantidad de Stock */}
        <FormField
          control={form.control}
          name="stock"
          rules={{
            required: "La cantidad es requerida.",
            min: { value: 0, message: "El stock no puede ser negativo." },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad en Stock</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ej: 100"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Variantes (Talla, Color, Género) */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Talla</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Talla" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SIZES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Color" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COLORS.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Género</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Género" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GENDERS.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

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
