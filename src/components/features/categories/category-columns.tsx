// src/components/features/categories/category-columns.tsx

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Category, AppPermissions } from "@/lib/definitions";
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

// Interface para las acciones
interface CategoryColumnActionsProps {
  category: Category;
  permissions: AppPermissions;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

// Componente de Acciones separado
function CategoryColumnActions({
  category,
  permissions,
  onEdit,
  onDelete,
}: CategoryColumnActionsProps) {
  const canUpdate = permissions.canUpdateCategory;
  const canDelete = permissions.canDeleteCategory;

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
          <DropdownMenuItem onClick={() => onEdit(category)}>
            Editar
          </DropdownMenuItem>
        )}

        {canDelete && (
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => onDelete(category)}
          >
            Eliminar
          </DropdownMenuItem>
        )}

        {!canUpdate && !canDelete && (
          <DropdownMenuItem disabled>Sin acciones permitidas</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Función principal que crea las columnas
export const createCategoryColumns = (
  permissions: AppPermissions,
  onEdit: (category: Category) => void,
  onDelete: (category: Category) => void
): ColumnDef<Category>[] => [
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

  // 2. Columna de Nombre
  {
    accessorKey: "name",
    header: "Nombre",
  },

  // 3. Columna de Descripción
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return description || <span className="text-muted-foreground">N/A</span>;
    },
  },

  // 4. Columna de Acciones (con RBAC)
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;
      return (
        <CategoryColumnActions
          category={category}
          permissions={permissions}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );
    },
  },
];
