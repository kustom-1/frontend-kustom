// src/components/features/RegisterForm.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { CreateUserDto, UserRole } from "@/lib/definitions";
import { authService } from "@/services/auth.service";
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
import { Mail, Lock, UserPlus, User, Eye, EyeOff } from "lucide-react";

type RegisterFormValues = Omit<CreateUserDto, "role" | "isActive">;

// Validaciones
const firstNameValidation = {
  required: "El nombre es requerido",
  minLength: {
    value: 2,
    message: "El nombre debe tener al menos 2 caracteres",
  },
  maxLength: {
    value: 50,
    message: "El nombre no puede tener más de 50 caracteres",
  },
  pattern: {
    value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    message: "El nombre solo puede contener letras",
  },
};

const lastNameValidation = {
  required: "El apellido es requerido",
  minLength: {
    value: 2,
    message: "El apellido debe tener al menos 2 caracteres",
  },
  maxLength: {
    value: 50,
    message: "El apellido no puede tener más de 50 caracteres",
  },
  pattern: {
    value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    message: "El apellido solo puede contener letras",
  },
};

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

const passwordValidation = {
  required: "La contraseña es requerida",
  minLength: {
    value: 8,
    message: "La contraseña debe tener al menos 8 caracteres",
  },
  maxLength: {
    value: 50,
    message: "La contraseña no puede tener más de 50 caracteres",
  },
  validate: {
    hasUpperCase: (value: string) =>
      /[A-Z]/.test(value) || "Debe contener al menos una mayúscula",
    hasLowerCase: (value: string) =>
      /[a-z]/.test(value) || "Debe contener al menos una minúscula",
    hasNumber: (value: string) =>
      /[0-9]/.test(value) || "Debe contener al menos un número",
  },
};

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<RegisterFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
    mode: "onBlur",
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

  // Mutación de Registro
  const registerMutation = useMutation({
    mutationFn: (data: CreateUserDto) => authService.register(data),
    onSuccess: (createdUser) => {
      if (cardRef.current) {
        animate(cardRef.current, {
          scale: [1, 1.05, 1],
          easing: "out(2)",
          duration: 400,
        });
      }

      toast.success("¡Registro exitoso!", {
        description: "Ya puedes iniciar sesión con tu cuenta.",
      });

      setTimeout(() => {
        router.push("/login");
      }, 500);
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.message || "Error al registrarse";
      setError(errorMsg);

      if (cardRef.current) {
        animate(cardRef.current, {
          translateX: [0, -10, 10, -10, 10, 0],
          easing: "out(2)",
          duration: 400,
        });
      }

      toast.error("Error en el Registro", { description: errorMsg });
    },
  });

  function onSubmit(values: RegisterFormValues) {
    setError(null);

    const submitBtn = document.querySelector('[type="submit"]');
    if (submitBtn) {
      animate(submitBtn, {
        scale: [1, 0.95, 1],
        easing: "out(2)",
        duration: 300,
      });
    }

    const fullData: CreateUserDto = {
      ...values,
      role: UserRole.Consultor,
      isActive: true,
    };
    registerMutation.mutate(fullData);
  }

  return (
    <Card
      ref={cardRef}
      className="w-full opacity-0 shadow-2xl border-border/50 bg-card/80 backdrop-blur-sm"
    >
      <CardHeader className="space-y-1 pb-6">
        <CardTitle ref={titleRef} className="text-2xl font-bold opacity-0">
          Crear Cuenta
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Completa tus datos para comenzar
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                rules={firstNameValidation}
                render={({ field }) => (
                  <FormItem className="form-field opacity-0">
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Nombre
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Juan"
                        {...field}
                        className="transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
                        autoComplete="given-name"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                rules={lastNameValidation}
                render={({ field }) => (
                  <FormItem className="form-field opacity-0">
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Apellido
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Pérez"
                        {...field}
                        className="transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
                        autoComplete="family-name"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

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
                      placeholder="juan.perez@kustom.com"
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
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="transition-all duration-300 focus:scale-[1.02] focus:shadow-lg pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Mínimo 8 caracteres, una mayúscula, una minúscula y un
                    número
                  </p>
                </FormItem>
              )}
            />

            {error && !registerMutation.isPending && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              disabled={registerMutation.isPending}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {registerMutation.isPending ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 transition-transform group-hover:scale-110" />
                    Registrarse
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary-foreground/10 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
