// src/components/features/LoginForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AuthUserDto, User } from "@/lib/definitions";
import { authService } from "@/services/auth.service";
import { useAppDispatch } from "@/lib/hooks";
import { setAuthUser } from "@/store/slices/authSlice";

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

export function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AuthUserDto>({
    defaultValues: { email: "", password: "" },
  });

  // Mutación de Login (Corregida)
  const loginMutation = useMutation({
    // La mutación ahora devuelve el objeto User directamente
    mutationFn: (credentials: AuthUserDto) => authService.login(credentials),
    onSuccess: (userData: User) => {
      // 3. Si el login es exitoso, guardamos en Redux
      dispatch(setAuthUser(userData));
      toast.success("¡Bienvenido!", {
        description: `Hola de nuevo, ${userData.firstName}.`,
      });
      router.push("/dashboard"); // Redirigimos
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.message || "Error al iniciar sesión";
      setError(errorMsg);
      toast.error("Error en el Login", { description: errorMsg });
    },
  });

  function onSubmit(values: AuthUserDto) {
    setError(null);
    loginMutation.mutate(values);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              rules={{ required: "El email es requerido" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="usuario@kustom.com" {...field} />
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

            {error && !loginMutation.isPending && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Cargando..." : "Entrar"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
