// src/components/features/RegisterForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { CreateUserDto, UserRole } from "@/lib/definitions";
import { authService } from "@/services/auth.service";

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
import { toast } from "sonner"; // Corregido: Usando Sonner
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RegisterFormValues = Omit<CreateUserDto, "role" | "isActive">;

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  // Mutación de Registro (Corregida)
  const registerMutation = useMutation({
    mutationFn: (data: CreateUserDto) => authService.register(data),
    onSuccess: (createdUser) => {
      toast.success("¡Registro exitoso!", {
        description: "Ya puedes iniciar sesión.",
      });
      router.push("/login"); // Redirigimos al login
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.message || "Error al registrarse";
      setError(errorMsg);
      toast.error("Error en el Registro", { description: errorMsg });
    },
  });

  function onSubmit(values: RegisterFormValues) {
    setError(null);
    const fullData: CreateUserDto = {
      ...values,
      role: UserRole.Consultor, // Como dicta el OAS para registro público
      isActive: true,
    };
    registerMutation.mutate(fullData);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="firstName"
                rules={{ required: "El nombre es requerido" }}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                rules={{ required: "El apellido es requerido" }}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input placeholder="Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              rules={{ required: "El email es requerido" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="juan.perez@kustom.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              rules={{ required: "La contraseña es requerida" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && !registerMutation.isPending && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creando cuenta..." : "Registrarse"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
