// src/components/features/cart/CheckoutDialog.tsx

"use client";

import { useState } from "react";
import { CreditCard, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>; // Promesa para esperar la simulación
  totalAmount: string; // El texto formateado (ej: "$120.00")
}

export function CheckoutDialog({
  open,
  onOpenChange,
  onConfirm,
  totalAmount,
}: CheckoutDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePay = async () => {
    setIsLoading(true);
    // Simulamos el tiempo de procesamiento de Stripe/Banco
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await onConfirm();
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isLoading && onOpenChange(val)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" /> Pago Seguro
          </DialogTitle>
          <DialogDescription>
            Ingresa los detalles de tu tarjeta para completar la compra.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Total a Pagar */}
          <div className="flex justify-between items-center bg-muted/50 p-3 rounded-md border">
            <span className="text-sm font-medium">Total a pagar:</span>
            <span className="text-lg font-bold text-primary">
              {totalAmount}
            </span>
          </div>

          <Separator />

          {/* Formulario Ficticio */}
          <div className="space-y-2">
            <Label htmlFor="cardName">Nombre en la tarjeta</Label>
            <Input
              id="cardName"
              placeholder="Juan Pérez"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Número de tarjeta</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                placeholder="0000 0000 0000 0000"
                disabled={isLoading}
              />
              <CreditCard className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiración</Label>
              <Input id="expiry" placeholder="MM/AA" disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <div className="relative">
                <Input
                  id="cvc"
                  placeholder="123"
                  type="password"
                  maxLength={3}
                  disabled={isLoading}
                />
                <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button className="w-full" onClick={handlePay} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...
              </>
            ) : (
              `Pagar ${totalAmount}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
