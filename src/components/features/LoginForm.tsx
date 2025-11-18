// src/components/features/LoginForm.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AuthUserDto, User } from "@/lib/definitions";
import { authService } from "@/services/auth.service";
import { useAppDispatch } from "@/lib/hooks";
import { setAuthUser } from "@/store/slices/authSlice";
import { animate } from "animejs";

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
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, LogIn } from "lucide-react";

// Validación robusta de email
const emailValidation = {
  required: "El email es requerido",
  pattern: {
    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: "Por favor ingresa un email válido",
  },
  minLength: {
    value: 5,
    message: "El email debe tener al menos 5 caracteres",
  },
  maxLength: {
    value: 100,
    message: "El email no puede tener más de 100 caracteres",
  },
  validate: {
    noSpaces: (value: string) =>
      !/\s/.test(value) || "El email no puede contener espacios",
    validDomain: (value: string) => {
      const domain = value.split("@")[1];
      return domain?.includes(".") || "El dominio del email no es válido";
    },
  },
};

// Validación de contraseña
const passwordValidation = {
  required: "La contraseña es requerida",
  minLength: {
    value: 4,
    message: "La contraseña debe tener al menos 4 caracteres",
  },
  maxLength: {
    value: 50,
    message: "La contraseña no puede tener más de 50 caracteres",
  },
};

export function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<AuthUserDto>({
    defaultValues: { email: "", password: "" },
    mode: "onBlur", // Validar cuando el campo pierde el foco
  });

  // Animaciones de entrada
  useEffect(() => {
    if (cardRef.current) {
      animate(cardRef.current, {
        opacity: [0, 1],
        translateY: [50, 0],
        scale: [0.95, 1],
        easing: "out(4)",
        duration: 800,
      });
    }

    if (titleRef.current) {
      animate(titleRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        easing: "out(3)",
        duration: 600,
        delay: 200,
      });
    }

    if (formRef.current) {
      const formElements = formRef.current.querySelectorAll(".form-field");
      animate(formElements, {
        opacity: [0, 1],
        translateX: [-30, 0],
        easing: "out(3)",
        duration: 600,
        delay: (el, i) => 300 + i * 100,
      });
    }
  }, []);

  // Mutación de Login
  const loginMutation = useMutation({
    mutationFn: (credentials: AuthUserDto) => authService.login(credentials),
    onSuccess: (userData: User) => {
      dispatch(setAuthUser(userData));

      // Animación de éxito
      if (cardRef.current) {
        animate(cardRef.current, {
          scale: [1, 1.05, 1],
          easing: "out(2)",
          duration: 400,
        });
      }

      toast.success("¡Bienvenido!", {
        description: `Hola de nuevo, ${userData.firstName}.`,
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.message || "Error al iniciar sesión";
      setError(errorMsg);

      // Animación de error (shake)
      if (cardRef.current) {
        animate(cardRef.current, {
          translateX: [0, -10, 10, -10, 10, 0],
          easing: "out(2)",
          duration: 400,
        });
      }

      toast.error("Error en el Login", { description: errorMsg });
    },
  });

  function onSubmit(values: AuthUserDto) {
    setError(null);

    // Animación del botón al hacer submit
    const submitBtn = document.querySelector('[type="submit"]');
    if (submitBtn) {
      animate(submitBtn, {
        scale: [1, 0.95, 1],
        easing: "out(2)",
        duration: 300,
      });
    }

    loginMutation.mutate(values);
  }

  return (
    <Card
      ref={cardRef}
      className="w-full max-w-md opacity-0 shadow-2xl border-border/50"
    >
      <CardHeader className="space-y-1">
        <CardTitle
          ref={titleRef}
          className="text-3xl font-bold text-center opacity-0"
        >
          Iniciar Sesión
        </CardTitle>
        <p className="text-center text-sm text-muted-foreground">
          Ingresa tus credenciales para continuar
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <FormField
              control={form.control}
              name="email"
              rules={emailValidation}
              render={({ field }) => (
                <FormItem className="form-field opacity-0">
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="usuario@kustom.com"
                      {...field}
                      className="transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
                      type="email"
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              rules={passwordValidation}
              render={({ field }) => (
                <FormItem className="form-field opacity-0">
                  <FormLabel className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Contraseña
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
                      autoComplete="current-password"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {error && !loginMutation.isPending && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              disabled={loginMutation.isPending}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loginMutation.isPending ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    Entrar
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary-foreground/10 to-primary/0 -translate-x-full group-hover:translate-x- transition-transform duration-1000" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
