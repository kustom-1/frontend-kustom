// src/components/features/cloths/cloth-columns.tsx

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Cloth, AppPermissions } from "@/lib/definitions";
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
interface ClothColumnActionsProps {
  cloth: Cloth;
  permissions: AppPermissions;
  onEdit: (cloth: Cloth) => void;
  onDelete: (cloth: Cloth) => void;
}

// Componente de Acciones separado
function ClothColumnActions({
  cloth,
  permissions,
  onEdit,
  onDelete,
}: ClothColumnActionsProps) {
  const canUpdate = permissions.canUpdateCloth;
  const canDelete = permissions.canDeleteCloth;

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
          <DropdownMenuItem onClick={() => onEdit(cloth)}>
            Editar
          </DropdownMenuItem>
        )}

        {canDelete && (
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => onDelete(cloth)}
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
export const createClothColumns = (
  permissions: AppPermissions,
  onEdit: (cloth: Cloth) => void,
  onDelete: (cloth: Cloth) => void
): ColumnDef<Cloth>[] => [
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

  // 3. Columna de Categoría (mostramos el ID por ahora)
  {
    accessorKey: "category",
    header: "Categoría",
    // Accedemos al objeto anidado para mostrar el nombre
    cell: ({ row }) => {
      const category = row.original.category;
      return category ? (
        <Badge variant="outline">{category.name}</Badge>
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    },
  },

  // 4. Columna de Precio Base
  {
    accessorKey: "basePrice",
    header: "Precio Base",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("basePrice"));
      if (isNaN(price))
        return <span className="text-muted-foreground">N/A</span>;
      // Formatear como moneda (ej: $19.99)
      const formatted = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP", // Asumimos COP, ajustar si es necesario
      }).format(price);
      return <div className="font-medium">{formatted}</div>;
    },
  },

  // 5. Columna de Descripción
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      if (!description)
        return <span className="text-muted-foreground">N/A</span>;
      // Acortar para la tabla
      return (
        <span title={description}>
          {description.substring(0, 30)}
          {description.length > 30 ? "..." : ""}
        </span>
      );
    },
  },

  // 6. Columna de Acciones (con RBAC)
  {
    id: "actions",
    cell: ({ row }) => {
      const cloth = row.original;
      return (
        <ClothColumnActions
          cloth={cloth}
          permissions={permissions}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );
    },
  },
];
