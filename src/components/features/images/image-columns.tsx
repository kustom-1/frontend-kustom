// src/components/features/images/image-columns.tsx

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { ImageType } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Box, ImageIcon, ExternalLink } from "lucide-react";

// Función principal
export const createImageColumns = (
  onDelete: (image: ImageType) => void
): ColumnDef<ImageType>[] => [
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

  // Vista Previa
  {
    accessorKey: "url",
    header: "Vista Previa",
    cell: ({ row }) => {
      const url = row.getValue("url") as string;
      const isModel = url.endsWith(".glb") || url.endsWith(".gltf");

      return (
        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden border">
          {isModel ? (
            <Box className="h-6 w-6 text-primary" />
          ) : (
            <img
              src={url}
              alt="preview"
              className="h-full w-full object-cover"
            />
          )}
        </div>
      );
    },
  },

  // Tags
  {
    accessorKey: "tags",
    header: "Etiquetas",
    cell: ({ row }) => {
      const tags = (row.getValue("tags") as string[]) || [];
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-[10px] px-1 py-0 h-5"
            >
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground">
              +{tags.length - 3}
            </span>
          )}
        </div>
      );
    },
  },

  // URL (Link)
  {
    id: "link",
    header: "Link",
    cell: ({ row }) => (
      <a
        href={row.original.url}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
      >
        Abrir <ExternalLink className="h-3 w-3" />
      </a>
    ),
  },

  // Acciones (Solo eliminar, editar imágenes no es común)
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={() => onDelete(row.original)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      );
    },
  },
];
