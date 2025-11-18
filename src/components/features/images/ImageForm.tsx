"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";

import { imageService } from "@/services/image.service";
import { TagsInput } from "@/components/ui/tags-input";
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
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface ImageFormProps {
  onClose: () => void;
}

type ImageFormValues = {
  file: FileList | null;
  tags: string[];
  isPublic: boolean;
};

export function ImageForm({ onClose }: ImageFormProps) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const form = useForm<ImageFormValues>({
    defaultValues: {
      file: null,
      tags: [],
      isPublic: true,
    },
  });

  const onSubmit = async (values: ImageFormValues) => {
    // Verificación robusta del archivo
    const file = values.file && values.file.length > 0 ? values.file[0] : null;

    if (!file) {
      form.setError("file", { message: "Debes seleccionar un archivo." });
      return;
    }

    setUploading(true);
    try {
      await imageService.uploadAndCreate(file, {
        tags: values.tags,
        isPublic: values.isPublic,
      });

      toast.success("Archivo subido y registrado.");
      queryClient.invalidateQueries({ queryKey: ["images"] });
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error en la subida", {
        description: "Revisa la consola o intenta de nuevo.",
      });
    } finally {
      setUploading(false);
    }
  };

  // Lógica solo para autocompletar tags, sin tocar el registro del archivo
  const handleFileTags = (file: File) => {
    const currentTags = form.getValues("tags");
    const newTags = new Set(currentTags);

    if (file.name.endsWith(".glb") || file.name.endsWith(".gltf")) {
      newTags.add("3d-model");
      newTags.add("base");
    } else {
      newTags.add("decal");
      newTags.add("texture");
    }
    form.setValue("tags", Array.from(newTags));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Input de Archivo */}
        <FormField
          control={form.control}
          name="file"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Archivo (Imagen o Modelo 3D)</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input
                    {...field} // Spread de props (name, ref, onBlur)
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.glb,.gltf"
                    disabled={uploading}
                    onChange={(e) => {
                      // 1. Actualizar el estado del formulario con los archivos
                      const files = e.target.files;
                      onChange(files);

                      // 2. Ejecutar lógica de tags si hay archivo
                      if (files && files.length > 0) {
                        handleFileTags(files[0]);
                      }
                    }}
                    // IMPORTANTE: El input file no debe tener value controlado por react
                    value={undefined}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Soporta PNG, JPG, WEBP y Modelos GLB/GLTF.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Input de Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Etiquetas (Tags)</FormLabel>
              <FormControl>
                <TagsInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Ej: 3d-model, decal, verano..."
                  disabled={uploading}
                />
              </FormControl>
              <FormDescription>
                Usa '3d-model' para modelos base y 'decal' para imágenes.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Es Público */}
        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Público</FormLabel>
                <FormDescription>
                  Disponible para todos los usuarios en el personalizador.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={uploading}
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
            disabled={uploading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={uploading}>
            {uploading ? (
              <span className="flex items-center gap-2">
                <UploadCloud className="animate-bounce h-4 w-4" /> Subiendo...
              </span>
            ) : (
              "Subir Archivo"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
