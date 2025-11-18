// src/components/features/roles/RoleForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type {
  RolePermission,
  CreateRolePermissionDto,
  UpdateRolePermissionDto,
  UserRole,
  ResourceList,
  ActionList,
} from "@/lib/definitions";
import { rolePermissionService } from "@/services/rolePermission.service";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoleFormProps {
  initialData: RolePermission | null; // Null = Crear, Objeto = Editar
  // Listas para poblar los desplegables
  resources: ResourceList;
  actions: ActionList;
  // Rol seleccionado en el cliente (para pre-rellenar)
  selectedRole: UserRole;
  onClose: () => void;
}

// El tipo para el formulario
type RoleFormValues = CreateRolePermissionDto;

export function RoleForm({
  initialData,
  resources,
  actions,
  selectedRole,
  onClose,
}: RoleFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;

  const form = useForm<RoleFormValues>({
    defaultValues: {
      role: initialData?.role || selectedRole, // Pre-rellenar con el rol activo
      resource: initialData?.resource || undefined,
      action: initialData?.action || undefined,
      effect: initialData?.effect || "allow",
    },
  });

  // --- Mutaciones ---
  const createMutation = useMutation({
    mutationFn: (data: CreateRolePermissionDto) =>
      rolePermissionService.create(data),
    onSuccess: (_, variables) => {
      toast.success("Permiso creado exitosamente.");
      // Invalidar solo los permisos del rol afectado
      queryClient.invalidateQueries({
        queryKey: ["rolePermissions", variables.role],
      });
      onClose();
    },
    onError: (err: any) => {
      toast.error("Error al crear permiso", {
        description: err.response?.data?.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateRolePermissionDto) =>
      rolePermissionService.update(initialData!.id, data),
    onSuccess: (_, variables) => {
      toast.success("Permiso actualizado exitosamente.");
      // Invalidar solo los permisos del rol afectado
      queryClient.invalidateQueries({
        queryKey: ["rolePermissions", variables.role || selectedRole],
      });
      onClose();
    },
    onError: (err: any) => {
      toast.error("Error al actualizar permiso", {
        description: err.response?.data?.message,
      });
    },
  });

  const onSubmit = (values: RoleFormValues) => {
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Rol (Desplegable) */}
        <FormField
          control={form.control}
          name="role"
          rules={{ required: "El rol es requerido." }}
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
                  <SelectItem value="Coordinador">Coordinador</SelectItem>
                  <SelectItem value="Auxiliar">Auxiliar</SelectItem>
                  <SelectItem value="Consultor">Consultor</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Recurso (Desplegable) */}
        <FormField
          control={form.control}
          name="resource"
          rules={{ required: "El recurso es requerido." }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recurso</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un recurso" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {resources.map((resource) => (
                    <SelectItem key={resource} value={resource}>
                      {resource}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Acción (Desplegable) */}
        <FormField
          control={form.control}
          name="action"
          rules={{ required: "La acción es requerida." }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Acción</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una acción" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {actions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Efecto (Desplegable) */}
        <FormField
          control={form.control}
          name="effect"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Efecto</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un efecto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="allow">Permitir (allow)</SelectItem>
                  <SelectItem value="deny">Denegar (deny)</SelectItem>
                </SelectContent>
              </Select>
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
