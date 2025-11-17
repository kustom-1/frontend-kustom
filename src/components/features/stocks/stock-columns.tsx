// src/components/features/stocks/stock-columns.tsx

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Stock, AppPermissions } from "@/lib/definitions";
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
interface StockColumnActionsProps {
  stock: Stock;
  permissions: AppPermissions;
  onEdit: (stock: Stock) => void;
  onDelete: (stock: Stock) => void;
}

// Componente de Acciones separado
function StockColumnActions({
  stock,
  permissions,
  onEdit,
  onDelete,
}: StockColumnActionsProps) {
  const canUpdate = permissions.canUpdateStock;
  const canDelete = permissions.canDeleteStock;

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
          <DropdownMenuItem onClick={() => onEdit(stock)}>
            Editar
          </DropdownMenuItem>
        )}

        {canDelete && (
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => onDelete(stock)}
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
export const createStockColumns = (
  permissions: AppPermissions,
  onEdit: (stock: Stock) => void,
  onDelete: (stock: Stock) => void
): ColumnDef<Stock>[] => [
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

  // 2. Columna de Prenda (Asumiendo que 'cloth' es un objeto anidado)
  {
    accessorKey: "cloth",
    header: "Prenda",
    cell: ({ row }) => {
      const cloth = row.original.cloth;
      // Asumimos que la API de GET /stocks devuelve el objeto 'cloth' anidado
      // basado en nuestro tipo 'Stock' en definitions.ts
      return cloth ? (
        <span>{cloth.name}</span>
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    },
  },

  // 3. Columna de Stock (Cantidad)
  {
    accessorKey: "stock",
    header: "Cantidad",
  },

  // 4. Variantes (Color, Talla, Género)
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => {
      const color = row.getValue("color") as string;
      return color ? (
        <Badge variant="outline">{color}</Badge>
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    },
  },
  {
    accessorKey: "size",
    header: "Talla",
    cell: ({ row }) => {
      const size = row.getValue("size") as string;
      return size ? (
        <Badge variant="outline">{size}</Badge>
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    },
  },
  {
    accessorKey: "gender",
    header: "Género",
    cell: ({ row }) => {
      const gender = row.getValue("gender") as string;
      return gender ? (
        <Badge variant="outline">{gender}</Badge>
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    },
  },

  // 5. Columna de Acciones (con RBAC)
  {
    id: "actions",
    cell: ({ row }) => {
      const stock = row.original;
      return (
        <StockColumnActions
          stock={stock}
          permissions={permissions}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );
    },
  },
];
