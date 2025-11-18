// src/components/features/cart/CartItemCard.tsx

"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Minus, Plus, ImageOff, Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CartDesignItem } from "@/lib/definitions";
import { cartDesignService } from "@/services/cartDesign.service";

interface CartItemCardProps {
  item: CartDesignItem;
  cartDesignId: number;
}

export function CartItemCard({ item, cartDesignId }: CartItemCardProps) {
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(item.quantity);

  // --- Mutación Cantidad ---
  const updateQuantityMutation = useMutation({
    mutationFn: (newQuantity: number) =>
      cartDesignService.updateQuantity(cartDesignId, newQuantity),
    onSuccess: () => {
      // No mostramos toast en cada click para no saturar,
      // solo invalidamos para actualizar el precio total
      queryClient.invalidateQueries({ queryKey: ["activeCartDetails"] });
    },
    onError: () => {
      toast.error("No se pudo actualizar la cantidad.");
      setQuantity(item.quantity); // Revertir en error
    },
  });

  // --- Mutación Eliminar ---
  const deleteMutation = useMutation({
    mutationFn: () => cartDesignService.delete(cartDesignId),
    onSuccess: () => {
      toast.success("Producto eliminado del carrito.");
      queryClient.invalidateQueries({ queryKey: ["activeCartDetails"] });
    },
    onError: () => toast.error("Error al eliminar el producto."),
  });

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity); // Actualización optimista de UI
    updateQuantityMutation.mutate(newQuantity);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  // Precios
  const unitPrice = item.quantity > 0 ? item.subtotal / item.quantity : 0;

  // Imagen defensiva
  const decalUrl = item.design.decalImage?.url;
  const modelUrl = item.design.baseModel?.url;
  const displayImageUrl = decalUrl || modelUrl;

  const isProcessing =
    updateQuantityMutation.isPending || deleteMutation.isPending;

  return (
    <Card className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 overflow-hidden transition-all hover:border-primary/50">
      {/* 1. IMAGEN DEL PRODUCTO */}
      <div className="relative w-full sm:w-32 h-32 bg-secondary/30 rounded-lg flex items-center justify-center overflow-hidden border shrink-0">
        {displayImageUrl ? (
          <img
            src={displayImageUrl}
            alt={item.design.name || "Diseño"}
            className="w-full h-full object-contain p-2 transition-transform group-hover:scale-105 duration-300"
          />
        ) : (
          <ImageOff className="w-8 h-8 text-muted-foreground/40" />
        )}
      </div>

      {/* 2. DETALLES E INFO */}
      <div className="flex-1 min-w-0 space-y-1 w-full">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg leading-tight truncate pr-4">
              {item.design.name || "Diseño Personalizado"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {item.design.description || "Sin descripción"}
            </p>
          </div>
          {/* Precio Total visible en móvil arriba a la derecha */}
          <p className="font-bold text-lg sm:hidden">
            {formatCurrency(item.subtotal)}
          </p>
        </div>

        {/* Badges de Atributos */}
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary" className="font-normal">
            {item.design.cloth?.name || "Prenda Base"}
          </Badge>
          <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border bg-background">
            <span
              className="w-3 h-3 rounded-full border"
              style={{ backgroundColor: item.design.baseColor }}
            />
            <span className="text-muted-foreground capitalize">
              {item.design.baseColor}
            </span>
          </div>
        </div>

        <div className="hidden sm:block mt-1">
          <span className="text-xs text-muted-foreground">
            Precio unitario: {formatCurrency(unitPrice)}
          </span>
        </div>
      </div>

      {/* 3. CONTROLES Y ACCIONES (Derecha en Desktop, Abajo en Mobile) */}
      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 sm:gap-2 mt-2 sm:mt-0">
        {/* Precio Total (Desktop) */}
        <p className="font-bold text-xl hidden sm:block">
          {formatCurrency(item.subtotal)}
        </p>

        <div className="flex items-center gap-4">
          {/* Selector de Cantidad */}
          <div className="flex items-center border rounded-md bg-background shadow-sm h-9">
            <Button
              variant="ghost"
              size="icon"
              className="h-full w-8 rounded-none rounded-l-md hover:bg-muted"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isProcessing}
            >
              <Minus className="h-3 w-3" />
            </Button>

            <div className="w-10 text-center text-sm font-medium tabular-nums flex items-center justify-center h-full border-x px-1">
              {updateQuantityMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              ) : (
                quantity
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-full w-8 rounded-none rounded-r-md hover:bg-muted"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isProcessing}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Botón Eliminar */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={() => deleteMutation.mutate()}
            disabled={isProcessing}
            title="Eliminar del carrito"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
