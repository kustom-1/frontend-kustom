// src/components/features/roles/role-columns.tsx

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { RolePermission, AppPermissions } from "@/lib/definitions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

// Interface para las acciones
interface RoleColumnActionsProps {
  permission: RolePermission;
  permissions: AppPermissions;
  onEdit: (permission: RolePermission) => void;
  onDelete: (permission: RolePermission) => void;
}

// Componente de Acciones separado
function RoleColumnActions({
  permission,
  permissions,
  onEdit,
  onDelete,
}: RoleColumnActionsProps) {
  // Solo el Coordinador puede editar permisos
  const canUpdate = permissions.canUpdateRoles;
  const canDelete = permissions.canUpdateRoles; // Asumimos que 'update' da permiso para borrar

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

        {canUpdate && (
          <DropdownMenuItem onClick={() => onEdit(permission)}>
            Editar
          </DropdownMenuItem>
        )}

        {canDelete && (
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => onDelete(permission)}
          >
            Eliminar
          </DropdownMenuItem>
        )}

        {!canUpdate && !canDelete && (
          <DropdownMenuItem disabled>No editable</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Función principal que crea las columnas
export const createRoleColumns = (
  permissions: AppPermissions,
  onEdit: (permission: RolePermission) => void,
  onDelete: (permission: RolePermission) => void
): ColumnDef<RolePermission>[] => [
  // 1. Columna de Checkbox
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

  // 2. Columna de Rol
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return <Badge variant="secondary">{role}</Badge>;
    },
  },

  // 3. Columna de Recurso
  {
    accessorKey: "resource",
    header: "Recurso",
    cell: ({ row }) => {
      const resource = row.getValue("resource") as string;
      return <span className="font-mono">{resource}</span>;
    },
  },

  // 4. Columna de Acción
  {
    accessorKey: "action",
    header: "Acción",
    cell: ({ row }) => {
      const action = row.getValue("action") as string;
      return <span className="font-mono">{action}</span>;
    },
  },

  // 5. Columna de Efecto
  {
    accessorKey: "effect",
    header: "Efecto",
    cell: ({ row }) => {
      const effect = row.getValue("effect") as string;
      const variant = effect === "allow" ? "default" : "destructive";
      return <Badge variant={variant}>{effect || "allow"}</Badge>;
    },
  },

  // 6. Columna de Acciones (con RBAC)
  {
    id: "actions",
    cell: ({ row }) => {
      const permission = row.original;
      return (
        <RoleColumnActions
          permission={permission}
          permissions={permissions} // Pasamos los permisos generales
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );
    },
  },
];
