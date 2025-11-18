// src/app/(main)/cart/page.tsx

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation"; // <-- Importar router
import { toast } from "sonner"; // <-- Importar sonner

import { useAppSelector } from "@/lib/hooks";
import { cartService } from "@/services/cart.service";
import { cartDesignService } from "@/services/cartDesign.service";
import { CartItemCard } from "@/components/features/cart/CartItemCard";
import { CheckoutDialog } from "@/components/features/cart/CheckoutDialog"; // <-- Importar Dialog
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

export default function CartPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false); // <-- Estado del modal

  // 1. Queries (Igual que antes)
  const {
    data: activeCart,
    isLoading: isLoadingCartId,
    isError: isErrorCartId,
    refetch: refetchCartId,
  } = useQuery({
    queryKey: ["activeCart"],
    queryFn: () => cartService.getActiveCart(),
    enabled: isAuthenticated,
  });

  const cartId = activeCart?.id;

  const {
    data: cartDetails,
    isLoading: isLoadingDetails,
    isError: isErrorDetails,
    refetch: refetchDetails,
  } = useQuery({
    queryKey: ["activeCartDetails", cartId],
    queryFn: () => cartDesignService.getCartDetails(cartId!),
    enabled: isAuthenticated && !!cartId,
  });

  // --- NUEVA LÓGICA DE PAGO ---

  // Mutación para "Cerrar" el carrito (Checkout)
  const checkoutMutation = useMutation({
    mutationFn: () => cartService.updateCart(cartId!, { isActive: false }),
    onSuccess: () => {
      // 1. Feedback Exitoso
      toast.success("¡Pago realizado con éxito!", {
        description: "Gracias por tu compra. Tu pedido ha sido procesado.",
        duration: 5000,
      });

      // 2. Limpiar caché para que la UI sepa que ya no hay carrito activo
      queryClient.invalidateQueries({ queryKey: ["activeCart"] });
      queryClient.invalidateQueries({ queryKey: ["activeCartDetails"] });

      // 3. Cerrar modal
      setIsCheckoutOpen(false);

      // 4. Redirigir (ej: al home o a una página de historial de pedidos)
      router.push("/");
    },
    onError: () => {
      toast.error("Hubo un error al procesar el pago.");
    },
  });

  const handleCheckoutConfirm = async () => {
    // Disparar la mutación y esperar a que termine (para que el modal muestre loading)
    await checkoutMutation.mutateAsync();
  };

  // ----------------------------

  const isLoading = isLoadingCartId || isLoadingDetails;
  const totalConEnvio = (cartDetails?.totalAmount ?? 0) + 5.0;
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  // ... (Manejo de Loading, Error y Empty State igual que antes) ...
  if (!isAuthenticated)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-4">
        <h1 className="text-2xl font-bold">Inicia Sesión</h1>
      </div>
    );
  if (isErrorCartId || isErrorDetails)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Button
          onClick={() => {
            refetchCartId();
            refetchDetails();
          }}
        >
          Reintentar
        </Button>
      </div>
    );
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-[70vh]">
        Cargando...
      </div>
    );

  const hasItems =
    cartDetails && cartDetails.designs && cartDetails.designs.length > 0;
  if (!hasItems) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-4">
        <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Tu Carrito Está Vacío</h1>
        <Button className="mt-4" onClick={() => router.push("/customize")}>
          Ir al Personalizador
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <ShoppingCart className="w-7 h-7" /> Tu Carrito de Compras
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna de Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartDetails?.designs.map((item, index) => (
            <CartItemCard
              key={index}
              item={item}
              // Recordar: Idealmente el backend debería devolver el ID de la relación CartDesign.
              // Si 'item' no tiene ID propio de relación, y usamos design.id, cuidado con la eliminación.
              // Asumimos que el DTO CartWithDesignsDto mapea correctamente.
              cartDesignId={item.id || item.design.id}
            />
          ))}
        </div>

        {/* Columna de Resumen */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Resumen del Pedido</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Productos ({cartDetails?.totalDesigns})</span>
                  <span className="font-medium">
                    {formatCurrency(cartDetails?.totalAmount ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío Estimado</span>
                  <span className="font-medium">$5.00</span>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Final</span>
                <span>{formatCurrency(totalConEnvio)}</span>
              </div>

              {/* Botón que abre el modal */}
              <Button
                className="w-full mt-6"
                onClick={() => setIsCheckoutOpen(true)}
                disabled={!activeCart}
              >
                Proceder al Pago
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- MODAL DE PAGO --- */}
      <CheckoutDialog
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        onConfirm={handleCheckoutConfirm}
        totalAmount={formatCurrency(totalConEnvio)}
      />
    </div>
  );
}
