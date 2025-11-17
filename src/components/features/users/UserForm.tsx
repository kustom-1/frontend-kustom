// src/components/features/users/UserForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { User, CreateUserDto } from "@/lib/definitions";
import { UserRole } from "@/lib/definitions";
import { userService } from "@/services/user.service";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";

interface UserFormProps {
  initialData: User | null; // Si es null, es 'Crear'. Si tiene datos, es 'Editar'.
  canManageRoles: boolean; // Permiso para mostrar/ocultar el campo 'rol'
  onClose: () => void; // Función para cerrar el Sheet/Modal
}

// Usaremos CreateUserDto como el tipo base para el formulario
// Hacemos 'password' opcional porque no siempre es requerido (en 'editar')
type UserFormValues = Omit<CreateUserDto, "password"> & {
  password?: string;
};

export function UserForm({
  initialData,
  canManageRoles,
  onClose,
}: UserFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;

  const form = useForm<UserFormValues>({
    // Sin resolver de Zod
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      password: "", // Siempre vacío por seguridad
      role: initialData?.role || UserRole.Consultor,
      isActive: initialData?.isActive || true,
    },
  });

  // Mutación de Creación
  const createMutation = useMutation({
    mutationFn: (data: CreateUserDto) => userService.create(data),
    onSuccess: () => {
      toast.success("Usuario creado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["users"] }); // Recargar la tabla
      onClose(); // Cerrar el panel
    },
    onError: (err: any) => {
      toast.error("Error al crear usuario", {
        description: err.response?.data?.message,
      });
    },
  });

  // Mutación de Edición
  const updateMutation = useMutation({
    mutationFn: (data: Partial<UserFormValues>) =>
      userService.update(initialData!.id, data),
    onSuccess: () => {
      toast.success("Usuario actualizado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["users"] }); // Recargar la tabla
      onClose(); // Cerrar el panel
    },
    onError: (err: any) => {
      toast.error("Error al actualizar usuario", {
        description: err.response?.data?.message,
      });
    },
  });

  const onSubmit = (values: UserFormValues) => {
    const dataToSubmit = { ...values };

    if (isEditing) {
      // Si estamos editando y la contraseña está vacía, la eliminamos
      if (!dataToSubmit.password) {
        delete dataToSubmit.password;
      }
      updateMutation.mutate(dataToSubmit);
    } else {
      // Si estamos creando, la contraseña es requerida (CreateUserDto lo exige)
      if (!dataToSubmit.password || dataToSubmit.password.length < 6) {
        form.setError("password", {
          type: "manual",
          message:
            "La contraseña es requerida y debe tener al menos 6 caracteres.",
        });
        return; // Detener el envío
      }
      // El 'dataToSubmit' calza con CreateUserDto
      createMutation.mutate(dataToSubmit as CreateUserDto);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            rules={{ required: "El nombre es requerido." }} // <-- Validación simple
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Juan" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            rules={{ required: "El apellido es requerido." }} // <-- Validación simple
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input placeholder="Pérez" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          rules={{
            required: "El email es requerido.",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Email inválido.",
            },
          }} // <-- Validación simple
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="juan.perez@kustom.com"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Contraseña */}
        <FormField
          control={form.control}
          name="password"
          // La regla de 'required' se maneja en el onSubmit para 'Crear'
          rules={{
            minLength: {
              value: 6,
              message: "Debe tener al menos 6 caracteres.",
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={
                    isEditing ? "Dejar en blanco para no cambiar" : "••••••••"
                  }
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- RBAC: Campo de Rol Condicional --- */}
        {canManageRoles && (
          <FormField
            control={form.control}
            name="role"
            rules={{ required: "Debes seleccionar un rol." }} // <-- Validación simple
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={UserRole.Coordinador}>
                      Coordinador
                    </SelectItem>
                    <SelectItem value={UserRole.Auxiliar}>Auxiliar</SelectItem>
                    <SelectItem value={UserRole.Consultor}>
                      Consultor
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Activo/Inactivo */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Activo</FormLabel>
                <FormDescription>
                  El usuario podrá iniciar sesión en la plataforma.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
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
