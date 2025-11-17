// src/components/features/users/user-columns.tsx

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { User, UserRole, AppPermissions } from "@/lib/definitions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

// Interface para las nuevas props
interface ColumnActionsProps {
  user: User;
  permissions: AppPermissions;
  currentUserRole: UserRole;
  onEdit: (user: User) => void; // <-- Nuevo callback
  onDelete: (user: User) => void; // <-- Nuevo callback
}

// Separamos las acciones en un componente para manejar los props
function ColumnActions({
  user,
  permissions,
  currentUserRole,
  onEdit,
  onDelete,
}: ColumnActionsProps) {
  // --- Lógica RBAC Fina (Tus Constraints) ---
  const canEditThisUser =
    permissions.canUpdateUser &&
    (currentUserRole === UserRole.Coordinador ||
      (currentUserRole === UserRole.Auxiliar &&
        user.role === UserRole.Consultor));

  const canDeleteThisUser =
    permissions.canDeleteUser &&
    (currentUserRole === UserRole.Coordinador ||
      (currentUserRole === UserRole.Auxiliar &&
        user.role === UserRole.Consultor));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>

        {/* --- Botones Condicionales --- */}
        {canEditThisUser && (
          <DropdownMenuItem
            onClick={() => onEdit(user)} // <-- Llama al callback
          >
            Editar
          </DropdownMenuItem>
        )}

        {canDeleteThisUser && (
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => onDelete(user)} // <-- Llama al callback
          >
            Eliminar
          </DropdownMenuItem>
        )}

        {!canEditThisUser && !canDeleteThisUser && (
          <DropdownMenuItem disabled>Sin acciones permitidas</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// La función principal ahora acepta los callbacks
export const createColumns = (
  permissions: AppPermissions,
  currentUserRole: UserRole,
  onEdit: (user: User) => void,
  onDelete: (user: User) => void
): ColumnDef<User>[] => [
  // 1. Columna de Checkbox (sin cambios)
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // 2. Columnas de Datos (sin cambios)
  {
    accessorKey: "firstName",
    header: "Nombre",
  },
  {
    accessorKey: "lastName",
    header: "Apellido",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => {
      const role = row.getValue("role") as UserRole;
      let variant: "default" | "secondary" | "destructive" = "secondary";
      if (role === UserRole.Coordinador) variant = "destructive";
      if (role === UserRole.Auxiliar) variant = "default";

      return <Badge variant={variant}>{role}</Badge>;
    },
  },

  // 4. Columna de Acciones (actualizada)
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <ColumnActions
          user={user}
          permissions={permissions}
          currentUserRole={currentUserRole}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );
    },
  },
];
